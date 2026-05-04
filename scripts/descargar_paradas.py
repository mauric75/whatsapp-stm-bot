#!/usr/bin/env python3
"""
Script para descargar datos de paradas del CKAN de Montevideo
y generar el archivo stops.json con las coordenadas geográficas.
"""

import json
import csv
import io
import sys
from urllib.request import urlopen
from urllib.error import URLError

# URL del ZIP de paradas del CKAN
ZIP_URL = "http://intgis.montevideo.gub.uy/sit/php/common/datos/generar_zip2.php?nom_tab=v_uptu_paradas&tipo=csv"

# Paradas de ejemplo (fallback si la descarga falla)
PARADAS_DEFAULT = [
    {"id": "1192", "nombre": "19 de Junio y Eduardo Raíz", "lat": -34.9055, "lng": -56.1844, "lineas": ["526", "G", "148", "329"]},
    {"id": "4190", "nombre": "18 de Julio y Convención", "lat": -34.9061, "lng": -56.1864, "lineas": ["3", "9", "30", "64", "121"]},
    {"id": "1190", "nombre": "Río Branco y 18 de Julio", "lat": -34.9058, "lng": -56.1835, "lineas": ["526", "G", "148"]},
    {"id": "1188", "nombre": "25 de Mayo y 18 de Julio", "lat": -34.9063, "lng": -56.1804, "lineas": ["526", "G", "148"]},
    {"id": "1000", "nombre": "Plaza Independencia", "lat": -34.9064, "lng": -56.2001, "lineas": ["9", "64", "121", "3"]},
    {"id": "2357", "nombre": "Bulevar Artigas y Av. Italia", "lat": -34.8932, "lng": -56.1589, "lineas": ["3", "30", "64"]},
    {"id": "1194", "nombre": "Colonia y Río Branco", "lat": -34.9048, "lng": -56.1838, "lineas": ["526", "G"]},
    {"id": "1196", "nombre": "Mercedes y Río Branco", "lat": -34.9045, "lng": -56.1840, "lineas": ["526", "G", "148"]},
    {"id": "1001", "nombre": "Ciudadela", "lat": -34.9060, "lng": -56.1980, "lineas": ["3", "9", "30"]},
    {"id": "2355", "nombre": "Av. Italia y Bulevar Artigas", "lat": -34.8930, "lng": -56.1592, "lineas": ["3", "30", "64", "121"]}
]

def descargar_paradas():
    """Intenta descargar paradas del CKAN. Si falla, usa las de fallback."""
    print("📥 Intentando descargar paradas del CKAN de Montevideo...")
    
    try:
        # Intentar descargar
        response = urlopen(ZIP_URL, timeout=10)
        csv_data = response.read().decode('utf-8')
        
        paradas = []
        reader = csv.DictReader(io.StringIO(csv_data))
        
        # Procesar CSV (campos varían según el formato del CKAN)
        for row in reader:
            try:
                parada = {
                    "id": row.get('codigo') or row.get('id') or '',
                    "nombre": row.get('nombre') or row.get('descripcion') or '',
                    "lat": float(row.get('latitud') or row.get('lat') or 0),
                    "lng": float(row.get('longitud') or row.get('lng') or 0),
                    "lineas": []
                }
                
                if parada['id'] and parada['nombre'] and parada['lat'] and parada['lng']:
                    paradas.append(parada)
            except (ValueError, KeyError):
                continue
        
        if paradas:
            print(f"✅ Se descargaron {len(paradas)} paradas exitosamente")
            return paradas
        else:
            raise Exception("No se procesaron paradas del CSV")
    
    except (URLError, TimeoutError, Exception) as e:
        print(f"⚠️  Error descargando del CKAN: {e}")
        print(f"📋 Usando {len(PARADAS_DEFAULT)} paradas de fallback")
        return PARADAS_DEFAULT

def guardar_paradas(paradas, output_file='data/stops.json'):
    """Guarda las paradas en formato JSON."""
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(paradas, f, ensure_ascii=False, indent=2)
        print(f"💾 Paradas guardadas en {output_file}")
        return True
    except Exception as e:
        print(f"❌ Error guardando archivo: {e}")
        return False

def main():
    """Función principal."""
    paradas = descargar_paradas()
    
    # Ordenar por ID para consistencia
    paradas.sort(key=lambda p: p.get('id', ''))
    
    # Guardar archivo
    if guardar_paradas(paradas):
        print(f"\n🎉 Listo! Se tienen {len(paradas)} paradas disponibles")
        return 0
    else:
        print("\n❌ No se pudo guardar el archivo")
        return 1

if __name__ == '__main__':
    sys.exit(main())
