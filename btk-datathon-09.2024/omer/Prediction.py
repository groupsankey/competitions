import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.impute import SimpleImputer
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import load_model

# Load test data
test_data = pd.read_csv('test_data.csv')

# Determine numeric and text columns
numeric_columns = test_data.select_dtypes(include=['number']).columns.tolist()
text_columns = test_data.select_dtypes(include=['object', 'string']).columns.tolist()

# Handle missing values for Text and Numeric Columns
imputer = SimpleImputer(strategy='constant', fill_value='missing')
test_data[text_columns] = imputer.fit_transform(test_data[text_columns])

# Handle missing values in numeric columns
numeric_imputer = SimpleImputer(strategy='mean')
test_data[numeric_columns] = numeric_imputer.fit_transform(test_data[numeric_columns])

# Numerical Data Processing
standardize = True  # Set to False if you prefer normalization

if standardize:
    scaler = StandardScaler()
    numeric_features = scaler.fit_transform(test_data[numeric_columns])
else:
    scaler = MinMaxScaler()
    numeric_features = scaler.fit_transform(test_data[numeric_columns])

# Text Data Processing

# Tokenization
tokenizer = Tokenizer(num_words=5000, oov_token="<OOV>")
text_data_combined = test_data[text_columns].astype(str).apply(lambda x: ' '.join(x), axis=1)
text_sequences = tokenizer.texts_to_sequences(text_data_combined)

# Padding/Truncating
max_sequence_length = 100  # Ensure consistency with training
text_features = pad_sequences(text_sequences, maxlen=max_sequence_length, padding='post', truncating='post')

# Combine Features
if len(numeric_columns) > 1:
    new_feature = np.prod(numeric_features[:, :2], axis=1).reshape(-1, 1)
    numeric_features = np.hstack((numeric_features, new_feature))

# Dimensionality Reduction (use the same PCA model if saved and loaded; here we fit new for simplicity)
pca = PCA(n_components=0.95)  # Adjust n_components if needed
combined_features = np.hstack((numeric_features, text_features))
reduced_features = pca.fit_transform(combined_features)

# Load the best model
model = load_model('neural_network_model.h5')

# Make predictions
predictions = model.predict(reduced_features)

# Save predictions to a CSV file
test_data['predictions'] = predictions
test_data.to_csv('test_predictions.csv', index=False)

print("Predictions saved to 'test_predictions.csv'")
