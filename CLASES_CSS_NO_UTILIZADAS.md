# ANÁLISIS DE CLASES CSS NO UTILIZADAS EN LAYOUT.CSS

## Clases UTILIZADAS ✅
- navigation-section (index.html)
- menu (index.html) 
- menu-link (index.html)
- menu-button (index.html)
- menu-icon (index.html)
- menu-text (index.html)
- menu-title (index.html)
- menu-description (index.html)
- controls-section (múltiples templates)
- menu-controls (múltiples templates)
- menu-controls-left (producto.html, cliente.html)
- menu-controls-right (producto.html, cliente.html)
- modal-overlay (usada por JS para mostrar modales)
- modal (múltiples templates)
- modal-header (múltiples templates)
- modal-body (múltiples templates)
- modal-footer (múltiples templates)
- modal-title (cliente.html, producto.html)
- modal-close (múltiples templates)
- site-footer (fragments/footer.html)
- footer-content (fragments/footer.html)
- footer-section (fragments/footer.html)
- tech-icons (fragments/footer.html)

## Clases NO UTILIZADAS ❌

### BREADCRUMB (completa sección sin usar):
- breadcrumb
- breadcrumb-item
- breadcrumb-item.active

### TARJETAS (sección casi completa sin usar):
- card
- card-header  
- card-title
- card-subtitle
- card-body
- card-footer
Nota: Solo se encontró "info-card" en formularios, que es diferente

### SEPARADORES (completa sección sin usar):
- divider
- divider-vertical

### ESTADOS DE CARGA (completa sección sin usar):
- loading-overlay
- loading-overlay.show
- loading-spinner
- loading-text

## RECOMENDACIONES

### 🗑️ ELIMINAR (clases completamente sin usar):
```css
/* === BREADCRUMB === */ (líneas ~130-160)
/* === SEPARADORES === */ (líneas ~230-240)  
/* === ESTADOS DE CARGA === */ (líneas ~250-280)
```

### 🤔 EVALUAR (clases con poco uso):
```css
/* === TARJETAS === */ (líneas ~160-230)
- Solo se usa "info-card" que es diferente de "card"
- Podrían eliminarse si no se planea usar sistema de tarjetas
```

## IMPACTO
- **Eliminando breadcrumb, separadores y loading**: ~100 líneas menos (~20% del archivo)
- **Eliminando también tarjetas**: ~150 líneas menos (~30% del archivo)
- **Beneficios**: CSS más limpio, menor tamaño de archivo, mantenimiento más fácil