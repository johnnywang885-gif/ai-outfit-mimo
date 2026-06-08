import os
import time
import urllib.request
import random

dest_dir = "D:/johnny-D/Gemini設計/AI穿搭-Mimo/穿搭照片/網站圖庫/Web推薦"
os.makedirs(dest_dir, exist_ok=True)

top_names = [
    "極簡寬版高磅純棉 T 恤", "絲質混紡立領休閒襯衫", "羊毛混紡針織開襟衫", "高級水洗法蘭絨襯衫", "清爽亞麻落肩襯衫",
    "細緻美麗諾羊毛毛衣", "寬鬆棉質落肩大學 T", "日系條紋五分袖上衣", "簡約修身立領長袖 T", "機能吸濕排汗 POLO 衫",
    "SUPIMA COTTON 圓領短袖", "重磅落肩水洗做舊短袖", "華夫格寬鬆圓領上衣", "細針織 V 領長袖毛衣", "高級純棉牛津襯衫",
    "工裝雙口袋多功能襯衫", "網眼透氣機能短袖 POLO", "純棉寬鬆落肩連帽上衣", "水洗做舊字母印花短袖", "簡約修身彈性長袖上衣",
    "精製寬版條紋長袖襯衫", "超彈性機能透氣短袖", "極簡莫代爾親膚短袖", "莫代爾混紡落肩上衣", "重磅工裝長袖襯衫",
    "復古寬條紋五分袖上衣", "涼感華夫格五分袖", "簡約立領水洗工裝襯衫", "精梳純棉微寬版短袖", "水洗棉質落肩圓領上衣"
]

bot_names = [
    "直筒原色修身牛仔褲", "修身繭型休閒寬褲", "機能防潑水工裝短褲", "極簡日系打褶西裝褲", "輕盈棉麻抽繩短褲",
    "工作風雙口袋長褲", "打褶錐形休閒長褲", "高級感打褶西裝褲", "高彈性防皺九分褲", "重磅純棉休閒運動短褲",
    "復古水洗直筒牛仔褲", "機能防風工裝束口褲", "質感燈芯絨休閒長褲", "透氣涼感鬆緊束口褲", "休閒水洗斜紋短褲",
    "極簡棉麻混紡直筒褲", "雙褶高級感羊毛西褲", "工作風拼接剪裁長褲", "微彈性修身九分長褲", "休閒鬆緊抽繩棉短褲",
    "復古刷色直筒牛仔褲", "機能防潑水登山短褲", "輕便透氣亞麻寬褲", "高級混紡打褶短西褲", "經典工裝束口長褲",
    "超彈力舒適束口褲", "日系寬版繭型牛仔褲", "高級感抓褶修身西裝褲", "輕量速乾機能運動長褲", "磨毛純棉抽繩休閒短褲"
]

out_names = [
    "防風機能防潑水連帽外套", "輕量保暖防風夾克外套", "質感細條紋燈芯絨外套", "復古丹寧工裝水洗外套", "經典雙排扣羊毛大衣",
    "日系極簡剪裁西裝外套", "保暖鋪棉飛行夾克外套", "多口袋防潑水工裝背心", "機能軟殼防風連帽外套", "立領修身防風短外套",
    "精紡西裝外套 (都會款)", "復古教練夾克外套", "保暖抓絨防風背心", "高級羊毛混紡立領大衣", "翻領休閒麂皮夾克",
    "輕薄防曬抗 UV 外套", "工裝重磅棉質野戰夾克", "羽絨保暖機能連帽大衣", "極簡開襟針織外套", "燈芯絨拼接休閒外套",
    "水洗做舊丹寧夾克", "無領輕羽絨便攜外套", "復古棒球夾克外套", "軍風 M-65 野戰夾克", "超細纖維刷毛保暖夾克",
    "雙面穿機能防風防潑水", "羊毛混紡西裝大衣", "工裝風多口袋防風背心", "極簡彈性防潑水夾克", "高級感修身毛料外套"
]

def get_tags_list(category, name):
    base = "mens"
    style = "flatlay,product"
    
    if category == 'top':
        if any(x in name for x in ["T 恤", "T恤", "大學 T", "短袖"]):
            return [f"{base},tshirt,{style}", f"{base},tshirt,isolated", f"{base},tshirt", f"{base},shirt"]
        elif "襯衫" in name:
            if "法蘭絨" in name:
                return [f"{base},flannel,shirt,{style}", f"{base},flannel,shirt", f"{base},shirt"]
            elif "牛津" in name:
                return [f"{base},oxford,shirt,{style}", f"{base},oxford,shirt", f"{base},shirt"]
            elif "工裝" in name:
                return [f"{base},workwear,shirt,{style}", f"{base},utility,shirt", f"{base},shirt"]
            elif "亞麻" in name:
                return [f"{base},linen,shirt,{style}", f"{base},linen,shirt", f"{base},shirt"]
            return [f"{base},shirt,{style}", f"{base},shirt,isolated", f"{base},shirt", f"{base},apparel"]
        elif any(x in name for x in ["毛衣", "針織", "開襟"]):
            return [f"{base},sweater,knitwear,{style}", f"{base},sweater,knitwear", f"{base},sweater", f"{base},shirt"]
        elif "POLO" in name or "polo" in name:
            return [f"{base},polo,shirt,{style}", f"{base},polo,shirt", f"{base},polo", f"{base},shirt"]
        elif "連帽" in name:
            return [f"{base},hoodie,{style}", f"{base},hoodie,isolated", f"{base},hoodie", f"{base},jacket"]
        else:
            return [f"{base},shirt,{style}", f"{base},apparel"]
            
    elif category == 'bottom':
        if "牛仔褲" in name:
            return [f"{base},jeans,denim,{style}", f"{base},jeans,denim", f"{base},jeans", f"{base},pants"]
        elif "短褲" in name:
            return [f"{base},shorts,{style}", f"{base},shorts,isolated", f"{base},shorts", f"{base},pants"]
        elif any(x in name for x in ["西裝褲", "西褲"]):
            return [f"{base},trousers,suit,{style}", f"{base},trousers,suit", f"{base},trousers", f"{base},pants"]
        elif any(x in name for x in ["長褲", "寬褲", "束口褲", "九分褲", "直筒褲"]):
            if "工裝" in name:
                return [f"{base},cargo,pants,{style}", f"{base},cargo,pants", f"{base},pants"]
            elif "燈芯絨" in name:
                return [f"{base},corduroy,pants,{style}", f"{base},corduroy,pants", f"{base},pants"]
            return [f"{base},pants,{style}", f"{base},pants,isolated", f"{base},pants", f"{base},trousers"]
        else:
            return [f"{base},pants,{style}", f"{base},jeans"]
            
    elif category == 'outerwear':
        if "大衣" in name or "風衣" in name:
            return [f"{base},coat,overcoat,{style}", f"{base},coat,overcoat", f"{base},coat", f"{base},jacket"]
        elif "西裝外套" in name:
            return [f"{base},blazer,suit,{style}", f"{base},blazer,suit", f"{base},blazer", f"{base},jacket"]
        elif "背心" in name:
            return [f"{base},vest,gilet,{style}", f"{base},vest,gilet", f"{base},vest", f"{base},jacket"]
        elif any(x in name for x in ["夾克", "外套"]):
            if "丹寧" in name or "牛仔" in name:
                return [f"{base},denim,jacket,{style}", f"{base},denim,jacket", f"{base},jacket"]
            elif "麂皮" in name:
                return [f"{base},suede,jacket,{style}", f"{base},suede,jacket", f"{base},jacket"]
            elif "工裝" in name or "野戰" in name:
                return [f"{base},military,jacket,{style}", f"{base},utility,jacket", f"{base},jacket"]
            elif "飛行" in name:
                return [f"{base},bomber,jacket,{style}", f"{base},bomber,jacket", f"{base},jacket"]
            return [f"{base},jacket,{style}", f"{base},jacket,isolated", f"{base},jacket", f"{base},coat"]
        else:
            return [f"{base},jacket,{style}", f"{base},coat"]
            
    return [f"{base},apparel,{style}", f"{base},clothing"]

def download_image(tags, lock_id, filename):
    url = f"https://loremflickr.com/400/500/{tags}?lock={lock_id}"
    filepath = os.path.join(dest_dir, filename)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            content = response.read()
            # 58745 is the specific placeholder size when LoremFlickr fails to find search results
            if len(content) == 58745 or len(content) < 5000:
                print(f"  [WARNING] Placeholder/Tiny file detected ({len(content)} bytes) for {filename}. Tag='{tags}'")
                return None
            
            with open(filepath, 'wb') as f:
                f.write(content)
            return len(content)
    except Exception as e:
        print(f"  [ERROR] Failed to download {filename} from {url}: {e}")
        return None

def main():
    items = []
    
    # Compile 90 items
    for i, name in enumerate(top_names):
        items.append(('top', name, f"top_{i+1}.jpg", i + 1))
        
    for i, name in enumerate(bot_names):
        items.append(('bottom', name, f"bottom_{i+1}.jpg", i + 1))
        
    for i, name in enumerate(out_names):
        items.append(('outerwear', name, f"outerwear_{i+1}.jpg", i + 1))

    print(f"Starting downloads for {len(items)} items with fallback rules...")
    
    # Track lock indices and current tag indices for each file
    locks = {item[2]: item[3] for item in items}
    tag_indices = {item[2]: 0 for item in items}
    downloaded_sizes = {}
    
    iteration = 0
    while True:
        iteration += 1
        print(f"\n--- Iteration {iteration} ---")
        
        # 1. Download missing or failed items
        for cat, name, filename, base_lock in items:
            filepath = os.path.join(dest_dir, filename)
            if filename in downloaded_sizes and downloaded_sizes[filename] is not None:
                continue
                
            tags_list = get_tags_list(cat, name)
            tag_idx = tag_indices[filename]
            
            # If we exhausted tags, we cycle back but modify lock
            tags = tags_list[tag_idx % len(tags_list)]
            current_lock = locks[filename]
            
            print(f"Downloading {filename} (lock={current_lock}, tags={tags}) for '{name}'...")
            size = download_image(tags, current_lock, filename)
            downloaded_sizes[filename] = size
            time.sleep(0.5)
            
        # 2. Check for duplicate sizes
        size_groups = {}
        for fname, size in downloaded_sizes.items():
            if size is not None:
                size_groups[size] = size_groups.get(size, []) + [fname]
                
        duplicates = []
        for size, fnames in size_groups.items():
            if len(fnames) > 1:
                print(f"[DUPLICATE] Size {size} bytes shared by: {', '.join(fnames)}")
                for dup_fname in fnames[1:]:
                    duplicates.append(dup_fname)
                    
        # 3. Check for failures (including placeholders that returned None)
        failures = [fname for fname, size in downloaded_sizes.items() if size is None]
        
        if not duplicates and not failures:
            print("\n[SUCCESS] All 90 images downloaded successfully with unique sizes and no placeholders!")
            break
            
        print(f"\nHandling {len(duplicates)} duplicates and {len(failures)} failures...")
        
        for fname in duplicates:
            # Change lock & advance tag for duplicates
            locks[fname] = locks[fname] + random.randint(100, 1000)
            tag_indices[fname] = tag_indices[fname] + 1
            downloaded_sizes[fname] = None
            
        for fname in failures:
            # Advance tag & change lock slightly for failures
            locks[fname] = locks[fname] + random.randint(10, 100)
            tag_indices[fname] = tag_indices[fname] + 1
            downloaded_sizes[fname] = None
            
        if iteration > 20:
            print("\n[WARNING] Max iterations reached. Some duplicates or placeholders might remain.")
            break
            
    # Final check
    final_sizes = []
    missing_count = 0
    for cat, name, filename, base_lock in items:
        fp = os.path.join(dest_dir, filename)
        if os.path.exists(fp):
            final_sizes.append(os.path.getsize(fp))
        else:
            missing_count += 1
            
    print(f"\nFinal confirmation: {len(final_sizes)} files exist ({missing_count} missing). Unique sizes: {len(set(final_sizes))}/90")

if __name__ == '__main__':
    main()
