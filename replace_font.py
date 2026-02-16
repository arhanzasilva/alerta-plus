#!/usr/bin/env python3
import os
import re

# Files to process
files = [
    '../src/app/pages/MapView.tsx',
    '../src/app/pages/ReportIncident.tsx',
    '../src/app/pages/Routes.tsx',
    '../src/app/pages/Profile.tsx'
]

for file_path in files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace font-black with font-bold
        new_content = content.replace('font-black', 'font-bold')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ Updated {file_path}")
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")

print("\n🎉 All files processed!")
