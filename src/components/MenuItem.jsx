import { Plus } from 'lucide-react';

const MenuItem = ({ item, onAddToCart, showAddButton = true }) => {
  const getEmoji = (category) => {
    const emojiMap = {
      'Pizza': '🍕',
      'Burgers': '🍔',
      'Sides': '🍟',
      'Drinks': '🥤',
      'Salads': '🥗',
      'Appetizers': '🍗',
      'Desserts': '🍰',
      'Pasta': '🍝',
      'Sandwiches': '🥪'
    };
    return emojiMap[category] || '🍽️';
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
      <div className="h-36 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
        <span className="text-5xl">{getEmoji(item.category)}</span>
      </div>
      <div className="p-4">
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-neutral-900 text-sm">{item.name}</h3>
            <span className="text-lg font-bold text-amber-600">${item.price.toFixed(2)}</span>
          </div>
          <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-xs font-medium">
            {item.category}
          </span>
          <p className="text-neutral-600 text-xs mt-2 line-clamp-2">{item.description}</p>
        </div>
        {showAddButton && onAddToCart && (
          <button
            onClick={() => onAddToCart(item)}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default MenuItem;