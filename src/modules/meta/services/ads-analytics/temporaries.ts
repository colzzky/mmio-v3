import { uiHelpers } from '@/core/utils/ui-helper'
import type { RowModel } from '@tanstack/vue-table'

export type RowsSelected<T> = RowModel<T> | null
export type ColumnsSelected = Map<(typeof metrics)[number], boolean>

export const metrics = [
  'spend',
  'purchaseValue',
  'returnOnAdSpend',
  'costPerPurchase',
  'costPerLinkClick',
  'costPerMille',
  'costPerClick',
  'averageOrderValue',
  'clickToAddToCartRatio',
  'addToCartToPurchaseRatio',
  'purchases',
  'firstFrameRetention',
  'thumbstopRatio',
  'clickThroughRateOutbound',
  'clickToPurchaseRatio',
  'clickThroughRateAll',
  'twentyFivePercentVideoPlays',
  'fiftyPercentVideoPlays',
  'seventyFivePercentVideoPlays',
  'oneHundredPercentVideoPlays',
  'holdRate',
] as const

export type Analytics = {
  post: {
    name: string
    image: string
    advertisementCount: number
  }
} & Record<(typeof metrics)[number], number>

export const metricLabels: Record<(typeof metrics)[number], string> = {
  spend: 'Spend',
  purchaseValue: 'Purchase Value',
  returnOnAdSpend: 'ROAS',
  costPerPurchase: 'CPA',
  costPerLinkClick: 'CPC (link click)',
  costPerMille: 'CPM',
  costPerClick: 'CPC (all)',
  averageOrderValue: 'AOV',
  clickToAddToCartRatio: 'Click To ATC ratio',
  addToCartToPurchaseRatio: 'ATC to purchase ratio',
  purchases: 'Purchases',
  firstFrameRetention: '1st frame retention',
  thumbstopRatio: 'Thumbstop',
  clickThroughRateOutbound: 'CTR (outbound)',
  clickToPurchaseRatio: 'Click to purchase',
  clickThroughRateAll: 'CTR (all)',
  twentyFivePercentVideoPlays: '25% video plays (rate)',
  fiftyPercentVideoPlays: '50% video plays (rate)',
  seventyFivePercentVideoPlays: '75% video plays (rate)',
  oneHundredPercentVideoPlays: '100% video plays (rate)',
  holdRate: 'Hold Rate',
}

export function formatAnalyticValues({
  key,
  value,
}: {
  key: (typeof metrics)[number]
  value: number
}) {
  switch (key) {
    case 'spend':
    case 'purchaseValue':
    case 'costPerPurchase':
    case 'costPerLinkClick':
    case 'costPerMille':
    case 'costPerClick':
    case 'averageOrderValue':
      return uiHelpers.formatToCurrency(value)

    case 'clickToAddToCartRatio':
    case 'addToCartToPurchaseRatio':
    case 'firstFrameRetention':
    case 'thumbstopRatio':
    case 'clickThroughRateOutbound':
    case 'clickToPurchaseRatio':
    case 'clickThroughRateAll':
    case 'twentyFivePercentVideoPlays':
    case 'fiftyPercentVideoPlays':
    case 'seventyFivePercentVideoPlays':
    case 'oneHundredPercentVideoPlays':
    case 'holdRate':
      return uiHelpers.formatToPercentage(value)

    default:
      return value
  }
}

export const analytics = [
  {
    post: {
      name: 'Eco-Friendly Bottle',
      image: 'https://picsum.photos/seed/bottle/250/250',
      advertisementCount: 1,
    },
    spend: 1200.75,
    purchaseValue: 3450.2,
    returnOnAdSpend: 2.87,
    costPerPurchase: 23.5,
    costPerLinkClick: 1.24,
    costPerMille: 12.5,
    costPerClick: 1.14,
    averageOrderValue: 68.9,
    clickToAddToCartRatio: 0.45,
    addToCartToPurchaseRatio: 0.65,
    purchases: 50,
    firstFrameRetention: 0.82,
    thumbstopRatio: 0.43,
    clickThroughRateOutbound: 0.18,
    clickToPurchaseRatio: 0.35,
    clickThroughRateAll: 0.25,
    twentyFivePercentVideoPlays: 0.75,
    fiftyPercentVideoPlays: 0.5,
    seventyFivePercentVideoPlays: 0.3,
    oneHundredPercentVideoPlays: 0.2,
    holdRate: 0.6,
  },
  {
    post: {
      name: 'Minimalist Backpack',
      image: 'https://picsum.photos/seed/backpack/250/250',
      advertisementCount: 32,
    },
    spend: 800.5,
    purchaseValue: 2100.45,
    returnOnAdSpend: 2.62,
    costPerPurchase: 20.2,
    costPerLinkClick: 1.15,
    costPerMille: 10.9,
    costPerClick: 0.95,
    averageOrderValue: 65.7,
    clickToAddToCartRatio: 0.4,
    addToCartToPurchaseRatio: 0.58,
    purchases: 40,
    firstFrameRetention: 0.77,
    thumbstopRatio: 0.39,
    clickThroughRateOutbound: 0.21,
    clickToPurchaseRatio: 0.32,
    clickThroughRateAll: 0.28,
    twentyFivePercentVideoPlays: 0.64,
    fiftyPercentVideoPlays: 0.48,
    seventyFivePercentVideoPlays: 0.33,
    oneHundredPercentVideoPlays: 0.18,
    holdRate: 0.58,
  },
  {
    post: {
      name: 'Smart Home Speaker',
      image: 'https://picsum.photos/seed/speaker/250/250',
      advertisementCount: 58,
    },
    spend: 1500.9,
    purchaseValue: 4200.34,
    returnOnAdSpend: 2.8,
    costPerPurchase: 25.9,
    costPerLinkClick: 1.35,
    costPerMille: 15.2,
    costPerClick: 1.12,
    averageOrderValue: 72.4,
    clickToAddToCartRatio: 0.48,
    addToCartToPurchaseRatio: 0.62,
    purchases: 55,
    firstFrameRetention: 0.8,
    thumbstopRatio: 0.41,
    clickThroughRateOutbound: 0.2,
    clickToPurchaseRatio: 0.34,
    clickThroughRateAll: 0.27,
    twentyFivePercentVideoPlays: 0.8,
    fiftyPercentVideoPlays: 0.6,
    seventyFivePercentVideoPlays: 0.35,
    oneHundredPercentVideoPlays: 0.22,
    holdRate: 0.65,
  },
  {
    post: {
      name: 'Wireless Earbuds',
      image: 'https://picsum.photos/seed/earbuds/250/250',
      advertisementCount: 40,
    },
    spend: 1100.3,
    purchaseValue: 3300.5,
    returnOnAdSpend: 3.0,
    costPerPurchase: 22.1,
    costPerLinkClick: 1.29,
    costPerMille: 13.5,
    costPerClick: 1.09,
    averageOrderValue: 68.3,
    clickToAddToCartRatio: 0.44,
    addToCartToPurchaseRatio: 0.59,
    purchases: 50,
    firstFrameRetention: 0.78,
    thumbstopRatio: 0.4,
    clickThroughRateOutbound: 0.19,
    clickToPurchaseRatio: 0.33,
    clickThroughRateAll: 0.26,
    twentyFivePercentVideoPlays: 0.74,
    fiftyPercentVideoPlays: 0.52,
    seventyFivePercentVideoPlays: 0.38,
    oneHundredPercentVideoPlays: 0.19,
    holdRate: 0.6,
  },
  {
    post: {
      name: 'Modern Desk Lamp',
      image: 'https://picsum.photos/seed/lamp/250/250',
      advertisementCount: 37,
    },
    spend: 950.7,
    purchaseValue: 2800.2,
    returnOnAdSpend: 2.95,
    costPerPurchase: 23.7,
    costPerLinkClick: 1.22,
    costPerMille: 11.8,
    costPerClick: 1.18,
    averageOrderValue: 70.2,
    clickToAddToCartRatio: 0.46,
    addToCartToPurchaseRatio: 0.61,
    purchases: 45,
    firstFrameRetention: 0.81,
    thumbstopRatio: 0.42,
    clickThroughRateOutbound: 0.22,
    clickToPurchaseRatio: 0.36,
    clickThroughRateAll: 0.29,
    twentyFivePercentVideoPlays: 0.7,
    fiftyPercentVideoPlays: 0.55,
    seventyFivePercentVideoPlays: 0.34,
    oneHundredPercentVideoPlays: 0.21,
    holdRate: 0.63,
  },
]
