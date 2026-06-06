import { useState, useEffect } from 'react'
import { Store, ShoppingCart, Tag, TrendingUp, Coins, Loader2 } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { RarityBadge } from '../common/RarityBadge'
import { formatNumber } from '../../utils/helpers'

export const MarketView = () => {
  const {
    marketListings, myListings, artifacts, materials, user,
    fetchMarketListings, fetchMyListings, fetchArtifacts, fetchMaterials,
    buyItem, listItem, cancelListing, getPriceSuggestion, isLoading
  } = useGameStore()
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSellItem, setSelectedSellItem] = useState<any>(null)
  const [sellPrice, setSellPrice] = useState<number>(0)
  const [priceSuggestion, setPriceSuggestion] = useState<any>(null)

  useEffect(() => {
    fetchMarketListings()
    fetchMyListings()
    fetchArtifacts()
    fetchMaterials()
  }, [fetchMarketListings, fetchMyListings, fetchArtifacts, fetchMaterials])

  const categories = [
    { id: 'all', name: '全部' },
    { id: 'fragment', name: '文物碎片' },
    { id: 'scroll', name: '古代卷轴' },
    { id: 'gem', name: '稀有宝石' },
    { id: 'material', name: '修复材料' },
  ]

  const filteredListings = selectedCategory === 'all'
    ? marketListings
    : marketListings.filter(l => l.itemType === selectedCategory)

  const sellableItems = [
    ...artifacts.filter(a => a.isIdentified).map(a => ({
      id: a.id, name: a.name, type: a.type, rarity: a.rarity, basePrice: Math.max(a.score * 10, 100)
    })),
    ...materials.filter(m => m.quantity > 0).map(m => ({
      id: m.id, name: m.name, type: 'material', rarity: m.rarity, basePrice: 500
    })),
  ]

  const handleSelectSellItem = async (item: any) => {
    setSelectedSellItem(item)
    setSellPrice(item.basePrice)
    try {
      const suggestion = await getPriceSuggestion(item.rarity, item.type)
      setPriceSuggestion(suggestion)
    } catch {
      setPriceSuggestion({ min: Math.floor(item.basePrice * 0.8), max: Math.floor(item.basePrice * 1.2), avg: item.basePrice })
    }
  }

  const handleBuy = async (listingId: string) => {
    try {
      await buyItem(listingId)
    } catch {}
  }

  const handleList = async () => {
    if (!selectedSellItem || sellPrice <= 0) return
    try {
      await listItem(
        selectedSellItem.id,
        selectedSellItem.type,
        sellPrice,
        priceSuggestion?.min || 0,
        priceSuggestion?.max || 0
      )
      setSelectedSellItem(null)
      setSellPrice(0)
      setPriceSuggestion(null)
    } catch {}
  }

  const handleCancel = async (listingId: string) => {
    try {
      await cancelListing(listingId)
    } catch {}
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Store className="w-7 h-7 text-amber-400" />
            交易市场
          </h2>
          <p className="text-gray-400 mt-1">与全服玩家交易文物和材料</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 font-bold text-lg">{formatNumber(user.gold)}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('buy')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'buy'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-slate-800/50 text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          购买商品
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'sell'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'bg-slate-800/50 text-gray-400 hover:text-white'
          }`}
        >
          <Tag className="w-5 h-5" />
          出售商品
        </button>
      </div>

      {activeTab === 'buy' ? (
        <>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.length === 0 ? (
              <div className="col-span-full text-center py-16 glass-card rounded-2xl text-gray-500">
                <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无商品，快来上架第一件吧！</p>
              </div>
            ) : (
              filteredListings.map(listing => (
                <div key={listing.id} className="glass-card rounded-xl p-4 hover:border-purple-500/50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold">{listing.itemName}</p>
                      <RarityBadge rarity={listing.rarity} size="sm" />
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold text-lg">{formatNumber(listing.price)}</div>
                      <div className="text-xs text-gray-500">卖家: {listing.sellerName}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuy(listing.id)}
                    disabled={isLoading || user.gold < listing.price}
                    className={`w-full py-2 rounded-lg font-semibold transition-all ${
                      user.gold < listing.price
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                    }`}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : '购买'}
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">选择要出售的物品</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {sellableItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无可出售物品</div>
              ) : (
                sellableItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectSellItem(item)}
                    className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                      selectedSellItem?.id === item.id
                        ? 'bg-purple-500/30 border border-purple-500'
                        : 'bg-slate-800/50 hover:bg-slate-700/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white">{item.name}</span>
                      <RarityBadge rarity={item.rarity} size="sm" />
                    </div>
                    <span className="text-gray-400 text-sm">参考: {formatNumber(item.basePrice)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">定价</h3>
              {!selectedSellItem ? (
                <div className="text-center py-8 text-gray-500">请先选择物品</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">出售价格 (金币)</label>
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <input
                        type="number"
                        value={sellPrice}
                        onChange={e => setSellPrice(Number(e.target.value))}
                        className="flex-1 px-4 py-3 bg-slate-800/70 border border-slate-700 rounded-lg text-white outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  {priceSuggestion && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 font-semibold text-sm">系统价格建议</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        建议区间: <span className="text-green-400">{formatNumber(priceSuggestion.min)}</span> - <span className="text-red-400">{formatNumber(priceSuggestion.max)}</span>
                      </p>
                      <p className="text-sm text-gray-400">均价: {formatNumber(priceSuggestion.avg)}</p>
                    </div>
                  )}
                  <button
                    onClick={handleList}
                    disabled={!sellPrice || sellPrice <= 0 || isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-bold transition-all"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : '上架出售'}
                  </button>
                </div>
              )}
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">我的上架</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {myListings.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">暂无上架商品</div>
                ) : (
                  myListings.map(listing => (
                    <div key={listing.id} className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm">{listing.itemName}</p>
                        <p className="text-yellow-400 text-xs">{formatNumber(listing.price)} 金币</p>
                      </div>
                      <button
                        onClick={() => handleCancel(listing.id)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm transition-colors"
                      >
                        下架
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
