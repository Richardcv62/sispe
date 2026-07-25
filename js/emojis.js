// ============================================================
// SISPE - emojis.js
// Librería de Emojis para Entidades y Sectores
// RUTA: js/emojis.js
// ============================================================

const EmojiLibrary = (function() {
    'use strict';

    // ---- CATEGORÍAS DE EMOJIS ----
    const CATEGORIES = {
        // Sectores Económicos
        SECTORES: {
            'Turismo': ['🏨', '🏖️', '🌊', '✈️', '🚌', '🏝️', '⛵', '🏄', '🌅', '🛳️'],
            'Agroindustria': ['🌾', '🚜', '🌽', '🌻', '🍊', '🍋', '🥑', '🌶️', '🧅', '🧄'],
            'Industria Alimenticia': ['🥫', '🍲', '🍞', '🥖', '🧀', '🥩', '🍗', '🥚', '🧈', '🍯'],
            'Energía': ['⚡', '🔋', '☀️', '💡', '🔌', '🪫', '🌞'],
            'Comunicaciones': ['📡', '💻', '🖥️', '📱', '📶', '📞', '📠', '📧', '🌐'],
            'Minería': ['⛏️', '🪨', '💎', '⛑️', '⚒️', '🔨', '🛠️'],
            'Pesca': ['🐟', '🐠', '🐡', '🦐', '🦀', '🐙', '⛵', '🎣'],
            'Reciclaje': ['♻️', '🗑️', '📦', '🔁', '🌱'],
            'Salud': ['💊', '🏥', '💉', '🩺', '🫀', '🧪', '🔬'],
            'Educación': ['📚', '🎓', '✏️', '📖', '📝', '🧑‍🏫', '👨‍🎓', '👩‍🎓'],
            'Justicia': ['⚖️', '📜', '📋', '🏛️', '🔍', '📑', '✍️'],
            'Economía': ['📊', '💰', '📈', '💳', '🏦', '💱', '📉', '🧾'],
            'Ciencia': ['🔬', '🧪', '🧬', '🔭', '📡', '🧫', '🧮'],
            'Control': ['🔍', '📋', '🔎', '📊', '📝', '✅'],
            'Deportes': ['🏋️', '⚽', '🏀', '🏐', '🎾', '🏓', '🏸', '🏊', '🚴', '🏃']
        },

        // Tipos de Entidades
        TIPOS: {
            'Hotel': ['🏨', '🏖️', '🌊', '🛏️', '🍽️', '🏝️'],
            'Agencia': ['✈️', '🚌', '🚢', '🚗', '🧳', '🗺️'],
            'Empresa': ['🏢', '🏭', '🏪', '📋', '📊'],
            'Cooperativa': ['🤝', '🌾', '🧑‍🌾', '🏢'],
            'Organismo': ['🏛️', '📜', '📋', '⚖️'],
            'Universidad': ['🎓', '📚', '🏛️', '🧑‍🏫']
        },

        // Generales
        GENERALES: ['⭐', '🌟', '✨', '🔥', '💪', '🎯', '🏆', '🥇', '🥈', '🥉', '❤️', '💙', '💚', '💛', '🧡', '💜']
    };

    // ---- EMOJIS POR SECTOR (vista rápida) ----
    const SECTOR_EMOJIS = {
        'Turismo': '🏨',
        'Agroindustria': '🌾',
        'Industria Alimenticia': '🥫',
        'Energía': '⚡',
        'Comunicaciones': '📡',
        'Minería': '⛏️',
        'Pesca': '🐟',
        'Reciclaje': '♻️',
        'Salud': '💊',
        'Educación': '📚',
        'Justicia': '⚖️',
        'Economía': '💰',
        'Ciencia': '🔬',
        'Control': '🔍',
        'Deportes': '🏋️'
    };

    // ---- EMOJIS POR ENTIDAD ESPECÍFICA (29 ENTIDADES) ----
    const ENTITY_EMOJIS = {
        // === TURISMO (6) ===
        'Hotel El Colony': '🏨',
        'Hotel Villa Miramar': '🏖️',
        'Hotel Internacional': '🌊',
        'Agencia de Viajes Cubatur': '✈️',
        'Agencia de Viajes Caracol': '🚌',
        'Cadena Hotelera Islazul': '🏝️',
        
        // === AGROINDUSTRIA (2) ===
        'Empresa Agroindustrial Jesús Montané Oropesa': '🌾',
        'Empresa Logística Agropecuaria': '🚜',
        
        // === INDUSTRIA ALIMENTICIA (1) ===
        'Empresa Municipal de la Industria Alimenticia': '🥫',
        
        // === ENERGÍA (1) ===
        'Empresa Eléctrica OBE': '⚡',
        
        // === COMUNICACIONES (3) ===
        'ETECSA': '📡',
        'Desoft': '💻',
        'UEB Servicios Informáticos EIMAG': '🖥️',
        
        // === MINERÍA (1) ===
        'Empresa Geominera': '⛏️',
        
        // === PESCA (1) ===
        'Empresa Pesquera Industrial': '🐟',
        
        // === RECICLAJE (1) ===
        'Empresa de Recuperación de Materias Primas': '♻️',
        
        // === SALUD (1) ===
        'Labiofam': '💊',
        
        // === EDUCACIÓN (2) ===
        'U/P Municipal Dirección de Educación': '📚',
        'Universidad de la Isla de la Juventud': '🎓',
        
        // === JUSTICIA (4) ===
        'Tribunal Especial Popular': '⚖️',
        'Fiscalía Municipal Especial': '📜',
        'Bufete Colectivo': '📋',
        'Dirección Municipal de Justicia': '🏛️',
        
        // === ECONOMÍA (4) ===
        'Asociación Nacional de Economistas ANEC': '📊',
        'Dirección Municipal de Finanzas y Precios': '💰',
        'Oficina ONEI': '📈',
        'Dirección Municipal de Comercio': '🛒',
        
        // === CIENCIA (1) ===
        'Delegación Territorial CITMA': '🔬',
        
        // === CONTROL (1) ===
        'Contraloría Municipal': '🔍'
    };

    // ---- FUNCIONES ----
    
    function getEmojiForSector(sector) {
        return SECTOR_EMOJIS[sector] || '🏢';
    }

    function getEmojiForEntity(nombre) {
        return ENTITY_EMOJIS[nombre] || '🏢';
    }

    function getEmojisByCategory(categoria) {
        return CATEGORIES[categoria] || CATEGORIES.GENERALES;
    }

    function getCategories() {
        return Object.keys(CATEGORIES);
    }

    function getRandomEmoji(categoria) {
        const emojis = CATEGORIES[categoria] || CATEGORIES.GENERALES;
        return emojis[Math.floor(Math.random() * emojis.length)];
    }

    function renderEmojiPicker(selectedEmoji, fieldId, categories) {
        categories = categories || ['SECTORES', 'TIPOS', 'GENERALES'];
        let html = `
            <div class="emoji-picker" id="emoji-picker-${fieldId}">
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
                    <button class="btn btn-sm btn-outline emoji-category-btn active" data-category="SECTORES">Sectores</button>
                    <button class="btn btn-sm btn-outline emoji-category-btn" data-category="TIPOS">Tipos</button>
                    <button class="btn btn-sm btn-outline emoji-category-btn" data-category="GENERALES">Generales</button>
                </div>
                <div class="emoji-grid" style="display:grid;grid-template-columns:repeat(10,1fr);gap:4px;max-height:200px;overflow-y:auto;padding:8px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
        `;

        const defaultCategory = categories[0];
        const emojis = CATEGORIES[defaultCategory] || CATEGORIES.GENERALES;
        emojis.forEach(emoji => {
            const selected = emoji === selectedEmoji ? 'selected' : '';
            html += `
                <div class="emoji-item ${selected}" 
                     data-emoji="${emoji}" 
                     style="font-size:28px;cursor:pointer;text-align:center;padding:4px;border-radius:8px;border:2px solid ${selected ? '#0a1e3c' : 'transparent'};"
                     onclick="EmojiLibrary.selectEmoji('${emoji}', '${fieldId}')">
                    ${emoji}
                </div>
            `;
        });

        html += `
                </div>
                <div style="margin-top:8px;text-align:center;">
                    <span style="font-size:14px;color:#64748b;">Emoji seleccionado: </span>
                    <span id="emoji-display-${fieldId}" style="font-size:32px;">${selectedEmoji || '🏢'}</span>
                </div>
            </div>
        `;

        return html;
    }

    function selectEmoji(emoji, fieldId) {
        const display = document.getElementById(`emoji-display-${fieldId}`);
        if (display) display.textContent = emoji;

        const input = document.getElementById(fieldId);
        if (input) input.value = emoji;

        const picker = document.getElementById(`emoji-picker-${fieldId}`);
        if (picker) {
            picker.querySelectorAll('.emoji-item').forEach(el => {
                el.classList.remove('selected');
                el.style.borderColor = 'transparent';
                if (el.dataset.emoji === emoji) {
                    el.classList.add('selected');
                    el.style.borderColor = '#0a1e3c';
                }
            });
        }
    }

    function initEmojiPicker(fieldId) {
        const picker = document.getElementById(`emoji-picker-${fieldId}`);
        if (!picker) return;

        picker.querySelectorAll('.emoji-category-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.dataset.category;
                
                picker.querySelectorAll('.emoji-category-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const grid = picker.querySelector('.emoji-grid');
                const emojis = CATEGORIES[category] || CATEGORIES.GENERALES;
                const selectedEmoji = document.getElementById(`emoji-display-${fieldId}`).textContent;
                
                grid.innerHTML = '';
                emojis.forEach(emoji => {
                    const selected = emoji === selectedEmoji ? 'selected' : '';
                    const div = document.createElement('div');
                    div.className = `emoji-item ${selected}`;
                    div.dataset.emoji = emoji;
                    div.style.cssText = `font-size:28px;cursor:pointer;text-align:center;padding:4px;border-radius:8px;border:2px solid ${selected ? '#0a1e3c' : 'transparent'};`;
                    div.textContent = emoji;
                    div.onclick = function() { selectEmoji(emoji, fieldId); };
                    grid.appendChild(div);
                });
            });
        });
    }

    return {
        getEmojiForSector: getEmojiForSector,
        getEmojiForEntity: getEmojiForEntity,
        getEmojisByCategory: getEmojisByCategory,
        getCategories: getCategories,
        getRandomEmoji: getRandomEmoji,
        renderEmojiPicker: renderEmojiPicker,
        selectEmoji: selectEmoji,
        initEmojiPicker: initEmojiPicker,
        SECTOR_EMOJIS: SECTOR_EMOJIS,
        ENTITY_EMOJIS: ENTITY_EMOJIS,
        CATEGORIES: CATEGORIES
    };

})();

window.EmojiLibrary = EmojiLibrary;
console.log('🎨 Librería de Emojis cargada correctamente.');