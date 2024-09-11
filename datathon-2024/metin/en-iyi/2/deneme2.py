import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, mean_squared_error
from gensim.models import Word2Vec
from gensim.utils import simple_preprocess
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import hstack
import joblib
from sklearn.model_selection import cross_val_score
from catboost import CatBoostRegressor

# Load the data
df = pd.read_csv('cleanedData.csv')

# Drop rows with missing target values
df = df.dropna(subset=['degerlendirme_puani'])

# Extract relevant columns for the classification model
cat_features = [
 'cinsiyet',
 'dogum_yeri',
 'ikametgah_sehri',
 'universite_adi',
 'universite_turu',
 'burslu_ise_burs_yuzdesi',
 'burs_aliyor_mu?',
 'bolum',
 'universite_kacinci_sinif',
 'universite_not_ortalamasi',
 'daha_once_baska_bir_universiteden_mezun_olmus',
 'lise_adi',
 'lise_adi_diger',
 'lise_sehir',
 'lise_turu',
 'lise_bolumu',
 'lise_bolum_diger',
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
 'uye_oldugunuz_kulubun_ismi',
 'profesyonel_bir_spor_daliyla_mesgul_musunuz?',
 'spor_dalindaki_rolunuz_nedir?',
 'aktif_olarak_bir_stk_uyesi_misiniz?',
 "hangi_stk'nin_uyesisiniz?",
 'stk_projesine_katildiniz_mi?',
 'girisimcilikle_ilgili_deneyiminiz_var_mi?',
 'ingilizce_biliyor_musunuz?',
 'ingilizce_seviyeniz?',
 'daha_onceden_mezun_olunduysa,_mezun_olunan_universite',
 'anne_sektor_encoded',
 'baba_sektor_encoded',
 'anne_Unknown',
 'anne_diger',
 'anne_kamu',
 'anne_ozel sektor',
 'baba_Unknown',
 'baba_diger',
 'baba_kamu',
 'baba_ozel sektor',
 'age'
]

text_columns = ['girisimcilikle_ilgili_deneyiminizi_aciklayabilir_misiniz?']
target_column = 'degerlendirme_puani'

# Handle missing values in text columns
df[text_columns] = df[text_columns].fillna('')

# Combine text columns into one for processing
df['combined_text'] = df[text_columns].apply(lambda x: ' '.join(x), axis=1)

# Tokenize and preprocess text data for Word2Vec
def preprocess_text(text):
    return simple_preprocess(text, deacc=True)

# Check if the Word2Vec model already exists
import os
if os.path.exists('word2vec_model.model'):
    # Load the previously saved Word2Vec model
    word2vec_model = Word2Vec.load('word2vec_model.model')
else:
    # Prepare Word2Vec model
    sentences = [preprocess_text(text) for text in df['combined_text']]
    word2vec_model = Word2Vec(sentences, vector_size=100, window=5, min_count=1, workers=4)
    # Save the Word2Vec model
    word2vec_model.save('word2vec_model.model')

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

# Debugging step: Verify columns in df and missing columns in cat_features
missing_cols = [col for col in cat_features if col not in df.columns]
if missing_cols:
    print("Warning: The following columns are missing from the DataFrame:", missing_cols)

# Prepare data for classification model
try:
    X_cat = df[cat_features]
except KeyError as e:
    print("Error: One or more columns are missing:", e)
    print("Available columns:", df.columns)
    raise

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
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])

# Split data for classification model
X_cat_train, X_cat_test, y_train, y_test = train_test_split(X_cat, y, test_size=0.2, random_state=42)

# Train classification model
clf_pipeline.fit(X_cat_train, y_train)

# Evaluate classification model
y_pred_cat = clf_pipeline.predict(X_cat_test)
print("Classification Model Accuracy:", accuracy_score(y_test, y_pred_cat))
print("Classification Report:\n", classification_report(y_test, y_pred_cat))

# Prepare data for regression model
# Debugging step: Print shapes and types
print("Shape of X_cat:", X_cat.shape)
print("Shape of combined_features:", combined_features.shape)
print("Type of X_cat:", type(X_cat))
print("Type of combined_features:", type(combined_features))
print("Dtype of X_cat:", X_cat.dtypes)
print("Dtype of combined_features:", combined_features.dtype)

# Identify numeric and categorical columns
numeric_features = X_cat.select_dtypes(include=['int64', 'float64']).columns
categorical_features = X_cat.select_dtypes(include=['object', 'bool']).columns

# Create preprocessor
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=True), categorical_features)
    ])

# Fit and transform the data
X_cat_preprocessed = preprocessor.fit_transform(X_cat)

# Debugging step: Print shapes after preprocessing
print("Shape of X_cat_preprocessed:", X_cat_preprocessed.shape)
print("Shape of combined_features:", combined_features.shape)

# Combine features
X_combined = hstack([X_cat_preprocessed, combined_features])

# Debugging step: Print final combined shape
print("Shape of X_combined:", X_combined.shape)

# Split data for regression model
X_train, X_test, y_train, y_test = train_test_split(X_combined, y, test_size=0.2, random_state=42)

# Modify CatBoost hyperparameters
catboost_model = CatBoostRegressor(
    iterations=2000,  # Increased iterations
    learning_rate=0.05,  # Lowered learning rate
    depth=8,  # Increased depth
    l2_leaf_reg=3,  # Added L2 regularization
    loss_function='RMSE',
    eval_metric='RMSE',
    random_seed=42,
    verbose=100,
    early_stopping_rounds=100  # Increased early stopping rounds
)

# Add feature selection
from sklearn.feature_selection import SelectFromModel

selector = SelectFromModel(estimator=CatBoostRegressor(iterations=100), threshold='median')
X_selected = selector.fit_transform(X_combined, y)

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

# Cross-validation
cv_scores = cross_val_score(catboost_model, X_combined, y, cv=5, scoring='neg_mean_squared_error')
print(f'Cross-validation RMSE: {(-cv_scores.mean())**0.5:.4f} (+/- {cv_scores.std() * 2:.4f})')

# Predict and evaluate regression model
y_pred_reg = catboost_model.predict(X_test)
mse = mean_squared_error(y_test, y_pred_reg)
rmse = mse ** 0.5
print(f'Regression Model RMSE: {rmse:.4f}')

# Print actual vs predicted values for regression
print("\nSample Actual vs. Predicted Values:")
for actual, predicted in zip(y_test[:10], y_pred_reg[:10]):
    print(f"Actual: {actual:.2f}, Predicted: {predicted:.2f}")

# Feature importance
feature_importance = catboost_model.feature_importances_
feature_names = preprocessor.get_feature_names_out().tolist() + [f'text_feature_{i}' for i in range(combined_features.shape[1])]
for name, importance in sorted(zip(feature_names, feature_importance), key=lambda x: x[1], reverse=True)[:20]:
    print(f"Feature: {name}, Importance: {importance:.4f}")

# Save the CatBoost model
catboost_model.save_model('catboost_model.cbimport pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, mean_squared_error
from gensim.models import Word2Vec
from gensim.utils import simple_preprocess
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import hstack
import joblib
from sklearn.model_selection import cross_val_score
from catboost import CatBoostRegressor

# Load the data
df = pd.read_csv('cleanedData.csv')

# Drop rows with missing target values
df = df.dropna(subset=['degerlendirme_puani'])

# Extract relevant columns for the classification model
cat_features = [
 'cinsiyet',
 'dogum_yeri',
 'ikametgah_sehri',
 'universite_adi',
 'universite_turu',
 'burslu_ise_burs_yuzdesi',
 'burs_aliyor_mu?',
 'bolum',
 'universite_kacinci_sinif',
 'universite_not_ortalamasi',
 'daha_once_baska_bir_universiteden_mezun_olmus',
 'lise_adi',
 'lise_adi_diger',
 'lise_sehir',
 'lise_turu',
 'lise_bolumu',
 'lise_bolum_diger',
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
 'uye_oldugunuz_kulubun_ismi',
 'profesyonel_bir_spor_daliyla_mesgul_musunuz?',
 'spor_dalindaki_rolunuz_nedir?',
 'aktif_olarak_bir_stk_uyesi_misiniz?',
 "hangi_stk'nin_uyesisiniz?",
 'stk_projesine_katildiniz_mi?',
 'girisimcilikle_ilgili_deneyiminiz_var_mi?',
 'ingilizce_biliyor_musunuz?',
 'ingilizce_seviyeniz?',
 'daha_onceden_mezun_olunduysa,_mezun_olunan_universite',
 'anne_sektor_encoded',
 'baba_sektor_encoded',
 'anne_Unknown',
 'anne_diger',
 'anne_kamu',
 'anne_ozel sektor',
 'baba_Unknown',
 'baba_diger',
 'baba_kamu',
 'baba_ozel sektor',
 'age'
]

text_columns = ['girisimcilikle_ilgili_deneyiminizi_aciklayabilir_misiniz?']
target_column = 'degerlendirme_puani'

# Handle missing values in text columns
df[text_columns] = df[text_columns].fillna('')

# Combine text columns into one for processing
df['combined_text'] = df[text_columns].apply(lambda x: ' '.join(x), axis=1)

# Tokenize and preprocess text data for Word2Vec
def preprocess_text(text):
    return simple_preprocess(text, deacc=True)

# Check if the Word2Vec model already exists
import os
if os.path.exists('word2vec_model.model'):
    # Load the previously saved Word2Vec model
    word2vec_model = Word2Vec.load('word2vec_model.model')
else:
    # Prepare Word2Vec model
    sentences = [preprocess_text(text) for text in df['combined_text']]
    word2vec_model = Word2Vec(sentences, vector_size=100, window=5, min_count=1, workers=4)
    # Save the Word2Vec model
    word2vec_model.save('word2vec_model.model')

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

# Debugging step: Verify columns in df and missing columns in cat_features
missing_cols = [col for col in cat_features if col not in df.columns]
if missing_cols:
    print("Warning: The following columns are missing from the DataFrame:", missing_cols)

# Prepare data for classification model
try:
    X_cat = df[cat_features]
except KeyError as e:
    print("Error: One or more columns are missing:", e)
    print("Available columns:", df.columns)
    raise

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
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])

# Split data for classification model
X_cat_train, X_cat_test, y_train, y_test = train_test_split(X_cat, y, test_size=0.2, random_state=42)

# Train classification model
clf_pipeline.fit(X_cat_train, y_train)

# Evaluate classification model
y_pred_cat = clf_pipeline.predict(X_cat_test)
print("Classification Model Accuracy:", accuracy_score(y_test, y_pred_cat))
print("Classification Report:\n", classification_report(y_test, y_pred_cat))

# Prepare data for regression model
# Debugging step: Print shapes and types
print("Shape of X_cat:", X_cat.shape)
print("Shape of combined_features:", combined_features.shape)
print("Type of X_cat:", type(X_cat))
print("Type of combined_features:", type(combined_features))
print("Dtype of X_cat:", X_cat.dtypes)
print("Dtype of combined_features:", combined_features.dtype)

# Identify numeric and categorical columns
numeric_features = X_cat.select_dtypes(include=['int64', 'float64']).columns
categorical_features = X_cat.select_dtypes(include=['object', 'bool']).columns

# Create preprocessor
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=True), categorical_features)
    ])

# Fit and transform the data
X_cat_preprocessed = preprocessor.fit_transform(X_cat)

# Debugging step: Print shapes after preprocessing
print("Shape of X_cat_preprocessed:", X_cat_preprocessed.shape)
print("Shape of combined_features:", combined_features.shape)

# Combine features
X_combined = hstack([X_cat_preprocessed, combined_features])

# Debugging step: Print final combined shape
print("Shape of X_combined:", X_combined.shape)

# Split data for regression model
X_train, X_test, y_train, y_test = train_test_split(X_combined, y, test_size=0.2, random_state=42)

# Modify CatBoost hyperparameters
catboost_model = CatBoostRegressor(
    iterations=2000,  # Increased iterations
    learning_rate=0.05,  # Lowered learning rate
    depth=8,  # Increased depth
    l2_leaf_reg=3,  # Added L2 regularization
    loss_function='RMSE',
    eval_metric='RMSE',
    random_seed=42,
    verbose=100,
    early_stopping_rounds=100  # Increased early stopping rounds
)

# Add feature selection
from sklearn.feature_selection import SelectFromModel

selector = SelectFromModel(estimator=CatBoostRegressor(iterations=100), threshold='median')
X_selected = selector.fit_transform(X_combined, y)

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

# Cross-validation
cv_scores = cross_val_score(catboost_model, X_combined, y, cv=5, scoring='neg_mean_squared_error')
print(f'Cross-validation RMSE: {(-cv_scores.mean())**0.5:.4f} (+/- {cv_scores.std() * 2:.4f})')

# Predict and evaluate regression model
y_pred_reg = catboost_model.predict(X_test)
mse = mean_squared_error(y_test, y_pred_reg)
rmse = mse ** 0.5
print(f'Regression Model RMSE: {rmse:.4f}')

# Print actual vs predicted values for regression
print("\nSample Actual vs. Predicted Values:")
for actual, predicted in zip(y_test[:10], y_pred_reg[:10]):
    print(f"Actual: {actual:.2f}, Predicted: {predicted:.2f}")

# Feature importance
feature_importance = catboost_model.feature_importances_
feature_names = preprocessor.get_feature_names_out().tolist() + [f'text_feature_{i}' for i in range(combined_features.shape[1])]
for name, importance in sorted(zip(feature_names, feature_importance), key=lambda x: x[1], reverse=True)[:20]:
    print(f"Feature: {name}, Importance: {importance:.4f}")

# Save the CatBoost model
catboost_model.save_model('catboost_model.cbm')
m')
