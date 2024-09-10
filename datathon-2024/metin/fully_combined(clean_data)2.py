import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression
from sklearn.metrics import classification_report, accuracy_score, mean_squared_error
from gensim.models import Word2Vec
from gensim.utils import simple_preprocess
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import hstack
import joblib

# Load the data
df = pd.read_csv('cleaned_dataset.csv')

# Drop rows with missing target values
df = df.dropna(subset=['degerlendirme_puani'])

# Extract relevant columns for the classification model
cat_features = [
    'cinsiyet', 'dogum_tarihi', 'dogum_yeri', 'ikametgah_sehri', 'universite_adi', 'universite_turu',
    'burslu_ise_burs_yuzdesi', 'burs_aliyor_mu?', 'bolum', 'universite_kacinci_sinif', 'universite_not_ortalamasi',
    'daha_once_baska_bir_universiteden_mezun_olmus', 'lise_adi', 'lise_adi_diger', 'lise_sehir', 'lise_turu',
    'lise_bolumu', 'lise_bolum_diger', 'lise_mezuniyet_notu', 'baska_bir_kurumdan_burs_aliyor_mu?',
    'burs_aldigi_baska_kurum', 'baska_kurumdan_aldigi_burs_miktari', 'anne_egitim_durumu', 'anne_calisma_durumu',
    'anne_sektor', 'baba_egitim_durumu', 'baba_calisma_durumu', 'baba_sektor', 'kardes_sayisi',
    'girisimcilik_kulupleri_tarzi_bir_kulube_uye_misiniz?', 'uye_oldugunuz_kulubun_ismi',
    'profesyonel_bir_spor_daliyla_mesgul_musunuz?', 'spor_dalindaki_rolunuz_nedir?', 'aktif_olarak_bir_stk_uyesi_misiniz?',
    "hangi_stk_nin_uyesisiniz?", 'stk_projesine_katildiniz_mi?', 'ingilizce_biliyor_musunuz?', 'ingilizce_seviyeniz?',
    'daha_onceden_mezun_olunduysa_mezun_olunan_universite'
]

text_columns = ['girisimcilikle_ilgili_deneyiminiz_var_mi?', 'girisimcilikle_ilgili_deneyiminizi_aciklayabilir_misiniz?']
target_column = 'degerlendirme_puani'

# Handle missing values in text columns
df[text_columns] = df[text_columns].fillna('')

# Combine text columns into one for processing
df['combined_text'] = df[text_columns].apply(lambda x: ' '.join(x), axis=1)

# Tokenize and preprocess text data for Word2Vec
def preprocess_text(text):
    return simple_preprocess(text, deacc=True)

# Prepare Word2Vec model
sentences = [preprocess_text(text) for text in df['combined_text']]
word2vec_model = Word2Vec(sentences, vector_size=100, window=5, min_count=1, workers=4)

# Create document vectors by averaging word vectors
def vectorize_text(text):
    tokens = preprocess_text(text)
    vectors = [word2vec_model.wv[token] for token in tokens if token in word2vec_model.wv]
    if len(vectors) == 0:
        return np.zeros(word2vec_model.vector_size)
    return np.mean(vectors, axis=0)

df['text_vector'] = df['combined_text'].apply(vectorize_text)
word2vec_features = np.array(df['text_vector'].tolist())

# TF-IDF Vectorization
text_data = df['combined_text']
tfidf_vectorizer = TfidfVectorizer(max_features=1000)
tfidf_vectors = tfidf_vectorizer.fit_transform(text_data)

# Combine Word2Vec and TF-IDF features
combined_features = hstack([tfidf_vectors, word2vec_features])

# Prepare data for classification model
X_cat = df[cat_features]
y = df[target_column]

# ColumnTransformer for encoding categorical features
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_features)
    ],
    remainder='passthrough'
)

# Classification pipeline
clf_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(random_state=42))
])

# Split data for classification model
X_cat_train, X_cat_test, y_train, y_test = train_test_split(X_cat, y, test_size=0.2, random_state=42)

# Hyperparameter grid for RandomForestClassifier
rf_param_grid = {
    'classifier__n_estimators': [100, 200, 300],
    'classifier__max_depth': [10, 20, 30],
    'classifier__min_samples_split': [2, 5, 10],
}

# Perform GridSearchCV for RandomForestClassifier
grid_search_clf = GridSearchCV(clf_pipeline, rf_param_grid, cv=5, n_jobs=-1, verbose=2)
grid_search_clf.fit(X_cat_train, y_train)

# Evaluate the best classification model
best_clf = grid_search_clf.best_estimator_
y_pred_cat = best_clf.predict(X_cat_test)
print("Best RandomForestClassifier Parameters:", grid_search_clf.best_params_)
print("Classification Model Accuracy:", accuracy_score(y_test, y_pred_cat))
print("Classification Report:\n", classification_report(y_test, y_pred_cat))

# Prepare data for regression model
X_combined = combined_features

# Split data for regression model
X_train, X_test, y_train, y_test = train_test_split(X_combined, y, test_size=0.2, random_state=42)

# Standardize features for regression
scaler = StandardScaler(with_mean=False)
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Regression pipeline
reg_pipeline = Pipeline(steps=[
    ('scaler', scaler),
    ('regressor', LinearRegression())
])

# Hyperparameter grid for LinearRegression (though simple, we can explore different fit_intercept options)
reg_param_grid = {
    'regressor__fit_intercept': [True, False]
}

# Perform GridSearchCV for LinearRegression
grid_search_reg = GridSearchCV(reg_pipeline, reg_param_grid, cv=5, n_jobs=-1, verbose=2)
grid_search_reg.fit(X_train, y_train)

# Evaluate the best regression model
best_reg = grid_search_reg.best_estimator_
y_pred_reg = best_reg.predict(X_test)
mse = mean_squared_error(y_test, y_pred_reg)
print(f'Regression Model Mean Squared Error: {mse:.2f}')
print("Best LinearRegression Parameters:", grid_search_reg.best_params_)

# Print actual vs predicted values for regression
print("\nSample Actual vs. Predicted Values:")
for actual, predicted in zip(y_test[:10], y_pred_reg[:10]):
    print(f"Actual: {actual}, Predicted: {predicted}")

# Save models
joblib.dump(best_clf, 'best_classification_model.pkl')
joblib.dump(best_reg, 'best_regression_model.pkl')
joblib.dump(scaler, 'scaler.pkl')
