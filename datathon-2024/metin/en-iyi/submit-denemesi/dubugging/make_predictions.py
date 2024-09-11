import pandas as pd
import numpy as np
from gensim.models import Word2Vec
from gensim.utils import simple_preprocess
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import hstack
from catboost import CatBoostRegressor
import joblib

# Load the test data
test_df = pd.read_csv('cleanedTest.csv')

# Load saved models and preprocessors
word2vec_model = Word2Vec.load('word2vec_model.model')
tfidf_vectorizer = joblib.load('tfidf_vectorizer.joblib')
preprocessor = joblib.load('preprocessor.joblib')
selector = joblib.load('feature_selector.joblib')

# Define necessary functions and variables
def preprocess_text(text):
    return simple_preprocess(text, deacc=True)

def vectorize_text(text):
    tokens = preprocess_text(text)
    vectors = [word2vec_model.wv[token] for token in tokens if token in word2vec_model.wv]
    if len(vectors) == 0:
        return np.zeros(word2vec_model.vector_size)
    return np.mean(vectors, axis=0)

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

# Preprocess test data
test_df[text_columns] = test_df[text_columns].fillna('')
test_df['combined_text'] = test_df[text_columns].apply(lambda x: ' '.join(x), axis=1)

# Create document vectors for test data
test_df['text_vector'] = test_df['combined_text'].apply(vectorize_text)
test_word2vec_features = np.array(test_df['text_vector'].tolist())

# TF-IDF Vectorization for test data
test_tfidf_vectors = tfidf_vectorizer.transform(test_df['combined_text'])

# Combine Word2Vec and TF-IDF features for test data
test_combined_features = hstack([test_tfidf_vectors, test_word2vec_features])

# Prepare test data for the model
X_test_cat = test_df[cat_features]

# Preprocess test data
X_test_cat_preprocessed = preprocessor.transform(X_test_cat)

# Combine features for test data
X_test_combined = hstack([X_test_cat_preprocessed, test_combined_features])

# Apply feature selection
X_test_selected = selector.transform(X_test_combined)

# Load the saved CatBoost model
loaded_model = CatBoostRegressor()
loaded_model.load_model('catboost_model.cbm')

# Make predictions
test_predictions = loaded_model.predict(X_test_selected)

# Create submission DataFrame
submission = pd.DataFrame({
    'id': test_df['id'],
    'Degerlendirme Puani': test_predictions
})

# Save the submission file
submission.to_csv('submission.csv', index=False)

print("Predictions have been saved to 'submission.csv'")