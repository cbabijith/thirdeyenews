import os

def main():
    svg_path = r"c:\flutter_projects\thirdeyenews\apps\admin_app\assets\images\logo.svg"
    html_path = r"c:\flutter_projects\thirdeyenews\apps\admin_app\scratch\render_logo.html"
    
    with open(svg_path, 'r', encoding='utf-8') as f:
        svg_content = f.read()
        
    # Remove xml declaration if present
    if svg_content.startswith('<?xml'):
        svg_content = svg_content[svg_content.find('?>')+2:]
        
    html_template = f"""<!DOCTYPE html>
<html>
<head>
  <style>
    body, html {{
      margin: 0;
      padding: 0;
      background-color: #F0F0F0;
      font-family: sans-serif;
    }}
    #status {{
      padding: 20px;
      font-size: 20px;
      font-weight: bold;
    }}
  </style>
</head>
<body>
  <div id="status">Loading...</div>
  <div style="display:none;" id="svg-container">
    {svg_content}
  </div>
  <canvas id="logo-canvas" width="1024" height="1024" style="border:1px solid black; display:block;"></canvas>
  <textarea id="output" style="width: 800px; height: 200px; margin-top:20px;"></textarea>

  <script>
    window.onload = function() {{
      try {{
        const svgElement = document.querySelector('svg');
        if (!svgElement) {{
          document.getElementById('status').innerText = 'ERROR: SVG element not found';
          return;
        }}
        svgElement.setAttribute('width', '144');
        svgElement.setAttribute('height', '72');
        
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], {{type: 'image/svg+xml;charset=utf-8'}});
        const url = URL.createObjectURL(svgBlob);
        
        const canvas = document.getElementById('logo-canvas');
        const ctx = canvas.getContext('2d');
        
        const img = new Image();
        img.onload = function() {{
          // Background Color D42B2B
          ctx.fillStyle = '#D42B2B';
          ctx.fillRect(0, 0, 1024, 1024);
          
          // Draw SVG centered with 10% padding
          // Canvas size = 1024
          // Content width = 819 (1024 * 0.8)
          // Content height = 409.5 (819 / 2)
          // Y Offset = (1024 - 409.5) / 2 = 307
          // X Offset = (1024 - 819) / 2 = 102
          ctx.drawImage(img, 102, 307, 819, 410);
          
          const base64 = canvas.toDataURL('image/png');
          document.getElementById('output').value = base64;
          document.getElementById('status').innerText = 'READY';
          URL.revokeObjectURL(url);
        }};
        img.onerror = function() {{
          document.getElementById('status').innerText = 'ERROR: Failed to load SVG image';
        }};
        img.src = url;
      }} catch (e) {{
        document.getElementById('status').innerText = 'ERROR: ' + e.toString();
      }}
    }};
  </script>
</body>
</html>
"""

    os.makedirs(os.path.dirname(html_path), exist_ok=True)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_template)
    print("HTML generator file created successfully at:", html_path)

if __name__ == "__main__":
    main()
