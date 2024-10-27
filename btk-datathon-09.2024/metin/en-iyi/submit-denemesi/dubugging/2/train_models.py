import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from gensim.models import Word2Vec
from gensim.utils import simple_preprocess
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import hstack
import joblib
from catboost import CatBoostRegressor, Pool
from sklearn.feature_selection import SelectFromModel
import os
from sklearn.ensemble import VotingRegressor

# Load the data
df = pd.read_csv('cleanedData.csv')

# Extract relevant columns for the classification model
cat_features = [
    'cinsiyet', 'dogum_yeri', 'ikametgah_sehri', 'universite_adi', 'universite_turu',
    'burslu_ise_burs_yuzdesi', 'burs_aliyor_mu?', 'universite_kacinci_sinif',
    'universite_not_ortalamasi', 'daha_once_baska_bir_universiteden_mezun_olmus',
    'lise_adi', 'lise_adi_diger', 'lise_sehir', 'lise_turu', 'lise_mezuniyet_notu',
    'baska_bir_kurumdan_burs_aliyor_mu?', 'burs_aldigi_baska_kurum',
    'baska_kurumdan_aldigi_burs_miktari', 'anne_egitim_durumu', 'anne_calisma_durumu',
    'baba_egitim_durumu', 'baba_calisma_durumu', 'kardes_sayisi',
    'girisimcilik_kulupleri_tarzi_bir_kulube_uye_misiniz?',
    'profesyonel_bir_spor_daliyla_mesgul_musunuz?', 'aktif_olarak_bir_stk_uyesi_misiniz?',
    'stk_projesine_katildiniz_mi?', 'girisimcilikle_ilgili_deneyiminiz_var_mi?',
    'ingilizce_biliyor_musunuz?', 'ingilizce_seviyeniz?',
    'daha_onceden_mezun_olunduysa_mezun_olunan_universite', 'anne_sektor_encoded',
    'baba_sektor_encoded', 'anne_unknown', 'anne_diger', 'anne_kamu', 'anne_ozel_sektor',
    'baba_unknown', 'baba_diger', 'baba_kamu', 'baba_ozel_sektor', 'age'
]

text_columns = [
    'girisimcilikle_ilgili_deneyiminizi_aciklayabilir_misiniz?', 
    'bolum', 'lise_bolumu', 'lise_bolum_diger', 'uye_oldugunuz_kulubun_ismi',
    'spor_dalindaki_rolunuz_nedir?', "hangi_stk_nin_uyesisiniz?"
]

# Preprocess data
df[text_columns] = df[text_columns].fillna('')
df['combined_text'] = df[text_columns].apply(lambda x: ' '.join(x), axis=1)

# Define preprocessing functions
def preprocess_text(text):
    return simple_preprocess(text, deacc=True)

def vectorize_text(text, model):
    tokens = preprocess_text(text)
    vectors = [model.wv[token] for token in tokens if token in model.wv]
    if len(vectors) == 0:
        return np.zeros(model.vector_size)
    return np.mean(vectors, axis=0)

# Train Word2Vec model
if not os.path.exists('word2vec_model.model'):
    sentences = [preprocess_text(text) for text in df['combined_text']]
    word2vec_model = Word2Vec(sentences, vector_size=100, window=5, min_count=1, workers=4)
    word2vec_model.save('word2vec_model.model')
else:
    word2vec_model = Word2Vec.load('word2vec_model.model')

# Create document vectors
df['text_vector'] = df['combined_text'].apply(lambda x: vectorize_text(x, word2vec_model))
word2vec_features = np.array(df['text_vector'].tolist())

# Train TF-IDF Vectorizer
tfidf_vectorizer = TfidfVectorizer(max_features=1000)
tfidf_vectors = tfidf_vectorizer.fit_transform(df['combined_text'])
joblib.dump(tfidf_vectorizer, 'tfidf_vectorizer.joblib')

# Combine Word2Vec and TF-IDF features
combined_features = hstack([tfidf_vectors, word2vec_features])

# Prepare data for the model
X_cat = df[cat_features]
y = df['degerlendirme_puani']

# ColumnTransformer for encoding categorical features
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_features),
        ('num', StandardScaler(), ['age'])
    ],
    remainder='passthrough'
)

# Fit preprocessor
X_cat_preprocessed = preprocessor.fit_transform(X_cat)

# Combine features
X_combined = hstack([X_cat_preprocessed, combined_features])

# Feature selection
selector = SelectFromModel(estimator=CatBoostRegressor(iterations=100), threshold='median')
X_selected = selector.fit_transform(X_combined, y)
joblib.dump(selector, 'feature_selector.joblib')

# Split data using selected features
X_train, X_test, y_train, y_test = train_test_split(X_selected, y, test_size=0.2, random_state=42)

# Define CatBoost model with adjusted hyperparameters
def create_catboost_model(learning_rate, depth, l2_leaf_reg):
    return CatBoostRegressor(
        iterations=2000,
        learning_rate=learning_rate,
        depth=depth,
        l2_leaf_reg=l2_leaf_reg,
        loss_function='RMSE',
        eval_metric='RMSE',
        random_seed=42,
        verbose=100,
        early_stopping_rounds=100
    )

# Define parameter grid for hyperparameter tuning
param_grid = {
    'learning_rate': [0.01, 0.03, 0.1],
    'depth': [4, 6, 8],
    'l2_leaf_reg': [1, 3, 5, 7]
}

# Perform k-fold cross-validation for hyperparameter tuning
kf = KFold(n_splits=5, shuffle=True, random_state=42)
best_score = float('inf')
best_params = None

for lr in param_grid['learning_rate']:
    for depth in param_grid['depth']:
        for l2 in param_grid['l2_leaf_reg']:
            model = create_catboost_model(lr, depth, l2)
            scores = cross_val_score(model, X_selected, y, cv=kf, scoring='neg_root_mean_squared_error')
            mean_score = -scores.mean()
            if mean_score < best_score:
                best_score = mean_score
                best_params = {'learning_rate': lr, 'depth': depth, 'l2_leaf_reg': l2}

print(f"Best parameters: {best_params}")
print(f"Best cross-validation RMSE: {best_score:.4f}")

# Train multiple models with the best parameters
n_models = 5
models = []

for i in range(n_models):
    model = create_catboost_model(**best_params)
    model.fit(
        X_train,
        y_train,
        eval_set=(X_test, y_test),
        use_best_model=True,
        verbose=100
    )
    models.append(('model_' + str(i), model))

# Create an ensemble model
ensemble_model = VotingRegressor(estimators=models)
ensemble_model.fit(X_train, y_train)

# Evaluate the ensemble model
ensemble_score = cross_val_score(ensemble_model, X_selected, y, cv=5, scoring='neg_root_mean_squared_error')
print(f"Ensemble model cross-validation RMSE: {-ensemble_score.mean():.4f} (+/- {ensemble_score.std() * 2:.4f})")

# Print feature importances (using the first model in the ensemble)
feature_importances = models[0][1].feature_importances_
feature_names = selector.get_feature_names_out()
importance_df = pd.DataFrame({'feature': feature_names, 'importance': feature_importances})
importance_df = importance_df.sort_values('importance', ascending=False)
print("Top 20 most important features:")
print(importance_df.head(20))

# Save the ensemble model
joblib.dump(ensemble_model, 'ensemble_model.joblib')

# Save the preprocessor
joblib.dump(preprocessor, 'preprocessor.joblib')

print("All models have been trained and saved.")
