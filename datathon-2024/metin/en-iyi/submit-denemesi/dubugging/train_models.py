import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from gensim.models import Word2Vec
from gensim.utils import simple_preprocess
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import hstack
import joblib
from catboost import CatBoostRegressor
from sklearn.feature_selection import SelectFromModel
import os

# Load the data
df = pd.read_csv('cleanedData.csv')

# Define text columns and cat_features
text_columns = [
    'girisimcilikle_ilgili_deneyiminizi_aciklayabilir_misiniz?', 
    'bolum', 
    'lise_bolumu', 
    'lise_bolum_diger',
    'uye_oldugunuz_kulubun_ismi',
    'spor_dalindaki_rolunuz_nedir?',
    "hangi_stk'nin_uyesisiniz?",
]

cat_features = [
    'cinsiyet',
    'universite',
    'sinif',
    'mezuniyet_yili',
    'lise_turu',
    'lise_sehir',
    'universite_sehir',
    'universite_bolum',
    'universite_bolum_diger',
    'yuksek_lisans',
    'yuksek_lisans_bolum',
    'yuksek_lisans_bolum_diger',
    'doktora',
    'doktora_bolum',
    'doktora_bolum_diger',
    'calisiyor_musunuz?',
    'is_deneyimi',
    'is_deneyimi_suresi',
    'staj_deneyimi',
    'staj_deneyimi_suresi',
    'girisimcilik_deneyimi',
    'girisimcilik_deneyimi_suresi',
    'kulup_uyeligi',
    'spor_dalinda_aktif_misiniz?',
    'stk_uyeligi',
]

# Preprocess data
df[text_columns] = df[text_columns].fillna('')
df['combined_text'] = df[text_columns].apply(lambda x: ' '.join(x), axis=1)

# Define preprocessing functions
def preprocess_text(text):
    return simple_preprocess(text, deacc=True)

def vectorize_text(text):
    tokens = preprocess_text(text)
    vectors = [word2vec_model.wv[token] for token in tokens if token in word2vec_model.wv]
    if len(vectors) == 0:
        return np.zeros(word2vec_model.vector_size)
    return np.mean(vectors, axis=0)

# Train Word2Vec model
if not os.path.exists('word2vec_model.model'):
    sentences = [preprocess_text(text) for text in df['combined_text']]
    word2vec_model = Word2Vec(sentences, vector_size=100, window=5, min_count=1, workers=4)
    word2vec_model.save('word2vec_model.model')
else:
    word2vec_model = Word2Vec.load('word2vec_model.model')

# Create document vectors
df['text_vector'] = df['combined_text'].apply(vectorize_text)
word2vec_features = np.array(df['text_vector'].tolist())

# Train TF-IDF Vectorizer
tfidf_vectorizer = TfidfVectorizer(max_features=1000)
tfidf_vectors = tfidf_vectorizer.fit_transform(df['combined_text'])
joblib.dump(tfidf_vectorizer, 'tfidf_vectorizer.joblib')

# Combine Word2Vec and TF-IDF features
combined_features = hstack([tfidf_vectors, word2vec_features])

# Prepare data for the model
X_cat = df[cat_features]
y = df['Degerlendirme Puani']

# Create preprocessor
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), ['mezuniyet_yili']),
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_features)
    ])

# Fit preprocessor
X_cat_preprocessed = preprocessor.fit_transform(X_cat)

# Combine features
X_combined = hstack([X_cat_preprocessed, combined_features])

# Train CatBoost model
catboost_model = CatBoostRegressor(
    iterations=2000,
    learning_rate=0.05,
    depth=8,
    l2_leaf_reg=3,
    loss_function='RMSE',
    eval_metric='RMSE',
    random_seed=42,
    verbose=100,
    early_stopping_rounds=100
)

# Feature selection
selector = SelectFromModel(estimator=CatBoostRegressor(iterations=100), threshold='median')
X_selected = selector.fit_transform(X_combined, y)
joblib.dump(selector, 'feature_selector.joblib')

# Split data using selected features
X_train, X_test, y_train, y_test = train_test_split(X_selected, y, test_size=0.2, random_state=42)

# Train the model with selected features
catboost_model.fit(
    X_train,
    y_train,
    eval_set=(X_test, y_test),
    use_best_model=True,
    verbose=100
)

# Save the CatBoost model
catboost_model.save_model('catboost_model.cbm')

# Save the preprocessor
joblib.dump(preprocessor, 'preprocessor.joblib')

print("All models have been trained and saved.")