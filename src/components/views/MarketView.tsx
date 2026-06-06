import { useState } from 'react'
import { Store, ShoppingCart, Tag, TrendingUp, Coins } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { RarityBadge } from '../common/RarityBadge'
import { formatNumber } from '../../utils/helpers'

export const MarketView = () => {
  const { marketListings, artifacts, materials, player, buyItem, listItem } = useGameStore()
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [message, setMessage] = useState<string>('')

  const categories = [
    { id: 'all', name: '全部' },
    { id: 'fragment', name: '文物碎片' },
    { id: 'gem', name: '稀有宝石' },
    { id: 'material', name: '修复材料' },
  ]

  const filteredListings = selectedCategory === 'all'
    ? marketListings
    : marketListings.filter(l => l.itemType === selectedCategory)

  const handleBuy = (listingId: string) => {
    const result = buyItem(listingId)
    setMessage(result.message)
    setTimeout(() => setMessage(''), 3000)
  }

  const sellableItems = [
    ...artifacts.filter(a => a.isRepaired).map(a => ({ id: a.id, name: a.name, type: 'fragment', rarity: a.rarity, basePrice: a.score * 10 })),
    ...materials.filter(m => m.quantity > 0).map(m => ({ id: m.id, name: m.name, type: 'material', rarity: m.rarity, basePrice: 500 })),
  ]

  const [selectedSellItem, setSelectedSellItem] = useState<any>(null)
  const [sellPrice, setSellPrice] = useState<number>(0)

  const handleList = () => {
    if (!selectedSellItem || sellPrice <= 0) return
    listItem(selectedSellItem.id, selectedSellItem.type, selectedSellItem.name, selectedSellItem.rarity, sellPrice)
    setSelectedSellItem(null)
    setSellPrice(0)
    setMessage('商品已上架！')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Store className="w-7 h-7 text-purple-400" />
            交易市场
          </h2>
          <p className="text-gray-400 mt-1">买卖文物、材料和宝石</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 font-bold">{formatNumber(player.gold)} 金币</span>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/50 text-green-300 font-medium">
          {message}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('buy')}
          className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'buy'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-purple-500/10 text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          购买商品
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'sell'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-purple-500/10 text-gray-400 hover:text-white'
          }`}
        >
          <Tag className="w-5 h-5" />
          出售物品
        </button>
      </div>

      {activeTab === 'buy' ? (
        <div className="space-y-4">
          <div className="flex gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-500/10 text-gray-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {filteredListings.map(listing => (
              <div key={listing.id} className="glass-card rounded-2xl p-5 hover:border-purple-500/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-white font-bold">{listing.itemName}</h4>
                    <RarityBadge rarity={listing.rarity} size="sm" />
                  </div>
                  <span className="text-3xl">
                    {listing.itemType === 'gem' ? '💎' : listing.itemType === 'material' ? '🧪' : '🏺'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">卖家</span>
                    <span className="text-white">{listing.sellerName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">类型</span>
                    <span className="text-white">
                      {listing.itemType === 'gem' ? '稀有宝石' : listing.itemType === 'material' ? '修复材料' : '文物碎片'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-500/10 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-blue-400 text-sm mb-1">
                    <TrendingUp className="w-4 h-4" />
                    系统建议价格区间
                  </div>
                  <p className="text-blue-300 font-bold">
                    {formatNumber(listing.suggestedMin)} - {formatNumber(listing.suggestedMax)} 金币
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-xl">{formatNumber(listing.price)}</span>
                  </div>
                  <button
                    onClick={() => handleBuy(listing.id)}
                    disabled={player.gold < listing.price}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                      player.gold >= listing.price
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    购买
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">可出售物品</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sellableItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedSellItem(item)
                    setSellPrice(item.basePrice)
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                    selectedSellItem?.id === item.id
                      ? 'bg-purple-500/30 border border-purple-500'
                      : 'bg-purple-500/10 hover:bg-purple-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.type === 'gem' ? '💎' : item.type === 'material' ? '🧪' : '🏺'}</span>
                    <div>
                      <p className="text-white font-medium">{item.name}</p>
                      <RarityBadge rarity={item.rarity} size="sm" />
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">建议: {formatNumber(item.basePrice)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">上架商品</h3>
            {selectedSellItem ? (
              <div className="space-y-6">
                <div className="text-center p-6 bg-purple-500/10 rounded-xl">
                  <span className="text-6xl">{selectedSellItem.type === 'gem' ? '💎' : selectedSellItem.type === 'material' ? '🧪' : '🏺'}</span>
                  <h4 className="text-xl font-bold text-white mt-3">{selectedSellItem.name}</h4>
                  <RarityBadge rarity={selectedSellItem.rarity} />
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">出售价格 (金币)</label>
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-white text-xl font-bold focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    系统建议价格: {formatNumber(Math.floor(selectedSellItem.basePrice * 0.8))} - {formatNumber(Math.floor(selectedSellItem.basePrice * 1.2))}
                  </p>
                </div>

                <button
                  onClick={handleList}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold transition-all"
                >
                  确认上架
                </button>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>选择一个物品开始出售</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
