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

# Extract relevant columns for the classification model
cat_features = [
 'cinsiyet',
 'dogum_yeri',
 'ikametgah_sehri',
 'universite_adi',
 'universite_turu',
 'burslu_ise_burs_yuzdesi',
 'burs_aliyor_mu?',
 'universite_kacinci_sinif',
 'universite_not_ortalamasi',
 'daha_once_baska_bir_universiteden_mezun_olmus',
 'lise_adi',
 'lise_adi_diger',
 'lise_sehir',
 'lise_turu',
 'lise_mezuniyet_notu',
 'baska_bir_kurumdan_burs_aliyor_mu?',
 'burs_aldigi_baska_kurum',
 'baska_kurumdan_aldigi_burs_miktari',
 'anne_egitim_durumu',
 'anne_calisma_durumu',
 'baba_egitim_durumu',
 'baba_calisma_durumu',
 'kardes_sayisi',
 'girisimcilik_kulupleri_tarzi_bir_kulube_uye_misiniz?',
 'profesyonel_bir_spor_daliyla_mesgul_musunuz?',
 'aktif_olarak_bir_stk_uyesi_misiniz?',
 'stk_projesine_katildiniz_mi?',
 'girisimcilikle_ilgili_deneyiminiz_var_mi?',
 'ingilizce_biliyor_musunuz?',
 'ingilizce_seviyeniz?',
 'daha_onceden_mezun_olunduysa,_mezun_olunan_universite',
 'anne_sektor_encoded',
 'baba_sektor_encoded',
 'anne_unknown',
 'anne_diger',
 'anne_kamu',
 'anne_ozel_sektor',
 'baba_unknown',
 'baba_diger',
 'baba_kamu',
 'baba_ozel_sektor',
 'age'
]

text_columns = [
    'girisimcilikle_ilgili_deneyiminizi_aciklayabilir_misiniz?', 
    'bolum', 
    'lise_bolumu', 
    'lise_bolum_diger',
    'uye_oldugunuz_kulubun_ismi',
    'spor_dalindaki_rolunuz_nedir?',
    "hangi_stk_nin_uyesisiniz?",
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