import json
import os

# Define age group bins
AGE_GROUPS = {
    'Balita (0-5 tahun)': ['UMUR 0', 'UMUR 5'],
    'Anak-anak (6-15 tahun)': ['UMUR 10', 'UMUR 15'],
    'Remaja (16-20 tahun)': ['UMUR 20'],
    'Dewasa Muda (21-30 tahun)': ['UMUR 25', 'UMUR 30'],
    'Dewasa (31-40 tahun)': ['UMUR 35', 'UMUR 40'],
    'Dewasa Akhir (41-60 tahun)': ['UMUR 45', 'UMUR 50', 'UMUR 55', 'UMUR 60'],
    'Lansia (>60 tahun)': ['UMUR 65', 'UMUR 70', 'UMUR 75']
}

def process_feature(feature):
    # Create a copy of the properties to modify
    new_properties = feature['properties'].copy()
    
    # Calculate new age group sums
    for group_name, age_keys in AGE_GROUPS.items():
        total = sum(
            int(new_properties.get(key, '0'))
            for key in age_keys
        )
        new_properties[group_name] = total
    
    # Remove individual age group properties
    for key in list(new_properties.keys()):
        if key.startswith('UMUR'):
            del new_properties[key]
    
    # Update the feature with new properties
    feature['properties'] = new_properties
    return feature

def main():
    # Define Jakarta regions and their corresponding file names
    jakarta_regions = {
        'jakbar': 'demografi-jakbar',
        'jakpus': 'demografi-jakpus',
        'jaksel': 'demografi-jaksel',
        'jaktim': 'demografi-jaktim',
        'jakut': 'demografi-jakut'
    }
    
    for region in jakarta_regions.values():
        try:
            # Define input and output file paths
            input_file = os.path.join('public', f'{region}.geojson')
            output_file = os.path.join('public', f'{region}-processed.geojson')
            
            # Read the input file
            with open(input_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Process each feature
            data['features'] = [process_feature(feature) for feature in data['features']]
            
            # Write to new file
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f'Successfully processed {region}')
            
        except Exception as e:
            print(f'Error processing {region}: {str(e)}')

if __name__ == "__main__":
    main()