import os
import time
import urllib.request
import json

dest_dir = "D:/johnny-D/Gemini設計/AI穿搭-Mimo/穿搭照片/網站圖庫/Web推薦"
os.makedirs(dest_dir, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def get_contents(path):
    url = f"https://api.github.com/repos/alexeygrigorev/clothing-dataset-small/contents/{path}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"[ERROR] Fetching GitHub contents for '{path}' failed: {e}")
        return []

def download_image(url, filepath):
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            content = response.read()
            with open(filepath, 'wb') as f:
                f.write(content)
            print(f"  [SUCCESS] Downloaded to {os.path.basename(filepath)}")
            return True
    except Exception as e:
        print(f"  [ERROR] Download failed for {url}: {e}")
        return False

def main():
    print("Fetching file lists from GitHub clothing-dataset-small...")
    
    # Get Tops
    print("Fetching Tops...")
    tshirts = get_contents("validation/t-shirt")
    shirts = get_contents("validation/shirt")
    top_urls = []
    # Collect 15 t-shirts and 15 shirts
    for x in tshirts[:15]:
        top_urls.append(x['download_url'])
    for x in shirts[:15]:
        top_urls.append(x['download_url'])
    # Fallback to train/t-shirt if not enough
    if len(top_urls) < 30:
        train_tshirts = get_contents("train/t-shirt")
        needed = 30 - len(top_urls)
        for x in train_tshirts[:needed]:
            top_urls.append(x['download_url'])
            
    # Get Bottoms
    print("Fetching Bottoms...")
    pants = get_contents("validation/pants")
    shorts = get_contents("validation/shorts")
    bot_urls = []
    # Collect 20 pants and 10 shorts
    for x in pants[:20]:
        bot_urls.append(x['download_url'])
    for x in shorts[:10]:
        bot_urls.append(x['download_url'])
    # Fallback to train/pants if not enough
    if len(bot_urls) < 30:
        train_pants = get_contents("train/pants")
        needed = 30 - len(bot_urls)
        for x in train_pants[:needed]:
            bot_urls.append(x['download_url'])
            
    # Get Outerwears
    print("Fetching Outerwears...")
    val_outwear = get_contents("validation/outwear")
    out_urls = []
    # Collect all outwears from validation
    for x in val_outwear:
        out_urls.append(x['download_url'])
    # Fill remaining from train/outwear
    if len(out_urls) < 30:
        train_outwear = get_contents("train/outwear")
        needed = 30 - len(out_urls)
        for x in train_outwear[:needed]:
            out_urls.append(x['download_url'])
            
    print(f"\nCollected URLs:")
    print(f"  Tops: {len(top_urls)} URLs")
    print(f"  Bottoms: {len(bot_urls)} URLs")
    print(f"  Outerwear: {len(out_urls)} URLs")
    
    # 1. Download Tops
    print("\nDownloading Tops (top_1.jpg to top_30.jpg)...")
    for i, url in enumerate(top_urls[:30]):
        filename = f"top_{i+1}.jpg"
        filepath = os.path.join(dest_dir, filename)
        download_image(url, filepath)
        time.sleep(0.1)
        
    # 2. Download Bottoms
    print("\nDownloading Bottoms (bottom_1.jpg to bottom_30.jpg)...")
    for i, url in enumerate(bot_urls[:30]):
        filename = f"bottom_{i+1}.jpg"
        filepath = os.path.join(dest_dir, filename)
        download_image(url, filepath)
        time.sleep(0.1)
        
    # 3. Download Outerwears
    print("\nDownloading Outerwears (outerwear_1.jpg to outerwear_30.jpg)...")
    for i, url in enumerate(out_urls[:30]):
        filename = f"outerwear_{i+1}.jpg"
        filepath = os.path.join(dest_dir, filename)
        download_image(url, filepath)
        time.sleep(0.1)
        
    print("\nAll dataset downloads finished successfully!")

if __name__ == '__main__':
    main()
