import { TAB_NAMES } from '../../constants'

const ProductTabs = ({
  activeTab,
  hasVideos,
  onTabChange
}) => {
  const tabs = [
    {
      key: TAB_NAMES.DESCRIPTION,
      label: '📝 Mô tả chi tiết',
      condition: true
    },
    {
      key: TAB_NAMES.SPECS,
      label: '⚙️ Thông số kỹ thuật',
      condition: true
    },
    {
      key: TAB_NAMES.VIDEOS,
      label: '🎥 Video',
      condition: hasVideos
    },
    {
      key: TAB_NAMES.WARRANTY,
      label: '🛡️ Bảo hành',
      condition: true
    }
  ]

  return (
    <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-700 mb-6 -mb-px">
      {tabs.filter(tab => tab.condition).map(tab => (
        <button
          key={tab.key}
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
            activeTab === tab.key
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default ProductTabs