import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { AssetType, ASSET_TYPES } from '../lib/supabase'

interface BrandAsset {
  id: string
  title: string
  asset_type: AssetType
  file_url: string | null
  file_data: string | null
  color_hex: string | null
  color_name: string | null
  tags: string[] | null
  quick_copy_code: string | null
  usage_notes: string | null
  last_used_at: string | null
  usage_count: number
  created_at: string
  updated_at: string
}


const ASSET_TYPE_ICONS: Record<AssetType, JSX.Element> = {
  logo: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  font: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  color: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="13.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="10.5" r="2.5" />
      <circle cx="8.5" cy="7.5" r="2.5" />
      <circle cx="6.5" cy="12.5" r="2.5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  template: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  image: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  video: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  audio: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  document: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  other: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
}

export function BrandAssets() {
  useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [assets] = useState<BrandAsset[]>([])
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showColorPalette, setShowColorPalette] = useState(false)
  const [colorPalette] = useState<string[]>([
    '#a78bfa', '#f472b6', '#0c0c0e', '#16161a', '#f5f5f7',
    '#60a5fa', '#fbbf24', '#34d399', '#f87171', '#818cf8'
  ])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredAssets = assets.filter(asset => {
    const matchesType = typeFilter === 'all' || asset.asset_type === typeFilter
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesType && matchesSearch
  })

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('success', `${label} copied to clipboard`)
    }).catch(() => {
      showToast('error', 'Failed to copy')
    })
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <>
      <div className="main-header">
        <h1 className="main-header-title">Brand Assets</h1>
        <div className="main-header-actions">
          <button 
            className={`btn ${showColorPalette ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowColorPalette(!showColorPalette)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="13.5" cy="6.5" r="2.5" />
              <circle cx="17.5" cy="10.5" r="2.5" />
              <circle cx="8.5" cy="7.5" r="2.5" />
              <circle cx="6.5" cy="12.5" r="2.5" />
            </svg>
            Color Palette
          </button>
        </div>
      </div>

      <div className="brand-assets-container">
        {/* Color Palette Generator */}
        {showColorPalette && (
          <div className="color-palette-section">
            <h2 className="section-title">Color Palette Generator</h2>
            <div className="color-palette-grid">
              {colorPalette.map((color, index) => (
                <div 
                  key={index}
                  className="color-swatch-large"
                  style={{ backgroundColor: color }}
                  onClick={() => copyToClipboard(color, color)}
                >
                  <span className="color-code">{color}</span>
                </div>
              ))}
            </div>
            <div className="palette-actions">
              <button 
                className="btn btn-ghost"
                onClick={() => {
                  const hexCodes = colorPalette.join(', ')
                  copyToClipboard(hexCodes, 'All colors')
                }}
              >
                Copy All
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="brand-filters">
          <div className="search-bar" style={{ flex: 1, maxWidth: '400px' }}>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${typeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTypeFilter('all')}
            >
              All
            </button>
            {ASSET_TYPES.map(type => (
              <button
                key={type.value}
                className={`view-toggle-btn ${typeFilter === type.value ? 'active' : ''}`}
                onClick={() => setTypeFilter(type.value as AssetType)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Assets Grid */}
        {filteredAssets.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <h2 className="empty-state-title">No assets found</h2>
            <p className="empty-state-description">
              {searchQuery ? 'Try adjusting your search' : 'Add your first brand asset to get started'}
            </p>
          </div>
        ) : (
          <div className="assets-grid">
            {filteredAssets.map(asset => (
              <div key={asset.id} className="asset-card">
                {/* Preview Area */}
                <div className="asset-preview">
                  {asset.asset_type === 'color' && asset.color_hex && (
                    <div 
                      className="color-preview"
                      style={{ backgroundColor: asset.color_hex }}
                      onClick={() => copyToClipboard(asset.color_hex!, 'Color')}
                    />
                  )}
                  {asset.asset_type === 'logo' && (
                    <div className="logo-preview">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    </div>
                  )}
                  {asset.asset_type === 'template' && (
                    <div className="template-preview">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="9" y1="21" x2="9" y2="9" />
                      </svg>
                      <span>Template</span>
                    </div>
                  )}
                  {asset.asset_type === 'font' && (
                    <div className="font-preview">
                      <span style={{ fontFamily: asset.file_data || 'Inter' }}>Aa</span>
                    </div>
                  )}
                  {asset.asset_type === 'image' && (
                    <div className="image-preview">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                  {!['color', 'logo', 'template', 'font', 'image'].includes(asset.asset_type) && (
                    <div className="generic-preview">
                      {ASSET_TYPE_ICONS[asset.asset_type]}
                    </div>
                  )}
                </div>

                {/* Asset Info */}
                <div className="asset-info">
                  <div className="asset-header">
                    <div className="asset-type-icon">
                      {ASSET_TYPE_ICONS[asset.asset_type]}
                    </div>
                    <h3 className="asset-title">{asset.title}</h3>
                  </div>

                  {asset.color_name && (
                    <p className="asset-color-name">{asset.color_name}</p>
                  )}

                  {asset.usage_notes && (
                    <p className="asset-notes">{asset.usage_notes}</p>
                  )}

                  {/* Tags */}
                  {asset.tags && asset.tags.length > 0 && (
                    <div className="asset-tags">
                      {asset.tags.map(tag => (
                        <span key={tag} className="asset-tag">{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Quick Copy */}
                  {asset.quick_copy_code && (
                    <div className="quick-copy-section">
                      <button 
                        className="quick-copy-btn"
                        onClick={() => copyToClipboard(asset.quick_copy_code!, 'Code')}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy Code
                      </button>
                    </div>
                  )}

                  {/* Usage Stats */}
                  <div className="asset-usage">
                    <span className="usage-count">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a10 10 0 1 0 10 10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Used {asset.usage_count} times
                    </span>
                    {asset.last_used_at && (
                      <span className="last-used">
                        Last: {new Date(asset.last_used_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .brand-assets-container {
          padding: var(--space-6);
        }

        .brand-filters {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
          flex-wrap: wrap;
        }

        .view-toggle {
          display: flex;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          padding: 2px;
          flex-wrap: wrap;
        }

        .view-toggle-btn {
          padding: var(--space-2) var(--space-3);
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
          font-size: var(--font-size-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .view-toggle-btn:hover {
          color: var(--color-text-secondary);
        }

        .view-toggle-btn.active {
          background: var(--color-bg-card);
          color: var(--color-accent);
        }

        .section-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-4);
        }

        .color-palette-section {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          margin-bottom: var(--space-6);
        }

        .color-palette-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--space-3);
        }

        .color-swatch-large {
          aspect-ratio: 1;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: var(--space-2);
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
        }

        .color-swatch-large:hover {
          transform: scale(1.05);
          box-shadow: var(--shadow-lg);
        }

        .color-code {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          background: rgba(0, 0, 0, 0.5);
          padding: 2px var(--space-2);
          border-radius: var(--radius-sm);
          color: white;
        }

        .palette-actions {
          margin-top: var(--space-4);
          display: flex;
          justify-content: flex-end;
        }

        .assets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-4);
        }

        .asset-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all var(--transition-fast);
        }

        .asset-card:hover {
          border-color: var(--color-border);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .asset-preview {
          height: 140px;
          background: var(--color-bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .color-preview {
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .color-preview:hover::after {
          content: 'Click to copy';
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          font-size: var(--font-size-sm);
        }

        .logo-preview,
        .template-preview,
        .image-preview,
        .font-preview,
        .generic-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          color: var(--color-text-muted);
        }

        .font-preview span {
          font-size: 48px;
          color: var(--color-text-primary);
        }

        .asset-info {
          padding: var(--space-4);
        }

        .asset-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-2);
        }

        .asset-type-icon {
          color: var(--color-accent);
        }

        .asset-title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
        }

        .asset-color-name {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          margin-bottom: var(--space-2);
        }

        .asset-notes {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-3);
          line-height: 1.5;
        }

        .asset-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
          margin-bottom: var(--space-3);
        }

        .asset-tag {
          font-size: var(--font-size-xs);
          padding: 2px var(--space-2);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
        }

        .quick-copy-section {
          margin-bottom: var(--space-3);
        }

        .quick-copy-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--color-accent-muted);
          border: none;
          border-radius: var(--radius-md);
          color: var(--color-accent);
          font-size: var(--font-size-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .quick-copy-btn:hover {
          background: var(--color-accent);
          color: var(--color-bg-primary);
        }

        .asset-usage {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
          padding-top: var(--space-3);
          border-top: 1px solid var(--color-border-subtle);
        }

        .usage-count {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        @media (max-width: 768px) {
          .brand-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .color-palette-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </>
  )
}
