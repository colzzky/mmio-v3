export const options: {
  identifier: string
  title: string
  icon: string
  description: string
}[] = [
  {
    identifier: 'meta_pages',
    title: 'Meta Pages',
    icon: 'bxl-meta',
    description:
      'Import and integrate a Meta page into this workspace and use it to create campaigns, chat bot, omnichannels',
  },
  {
    identifier: 'meta_groups',
    title: 'Meta Groups',
    icon: 'bx-group',
    description:
      'Import and integrate a Meta groups into this workspace and use it to create campaigns, chat bot, etc',
  },
  {
    identifier: 'instagram_accounts',
    title: 'Instagram Accounts',
    icon: 'bxl-instagram',
    description:
      'Import and integrate your IG Accounts into this workspace and use it to create campaigns, chat bot, etc',
  },
  {
    identifier: 'email_accounts',
    title: 'Email Accounts',
    icon: 'bx-envelope',
    description: 'Integrate your email account here and lorem ipsummmm',
  },
] as const

type Integration = { name: string; importedAt: Date; importedBy: string }
export const integrations: Record<(typeof options)[number]['identifier'], Integration[]> = {
  meta_pages: [
    {
      name: 'Labi mo Labi ko page',
      importedAt: new Date(2024, 10, 17), // 5 days ago
      importedBy: 'Paul Dela Vega',
    },
    {
      name: 'MMIO V3',
      importedAt: new Date(2024, 10, 17), // 5 days ago
      importedBy: 'Paul Dela Vega',
    },
    {
      name: 'EDGELORDDD',
      importedAt: new Date(2024, 10, 17), // 5 days ago
      importedBy: 'Paul Dela Vega',
    },
  ],
  meta_groups: [
    {
      name: 'Group 1',
      importedAt: new Date(2024, 10, 19), // 3 days ago
      importedBy: 'John Doe',
    },
    {
      name: 'Group 2',
      importedAt: new Date(2024, 10, 20), // 2 days ago
      importedBy: 'Jane Smith',
    },
  ],
  instagram_accounts: [
    {
      name: '@cool_insta_account',
      importedAt: new Date(2024, 10, 21), // 1 day ago
      importedBy: 'Alice Brown',
    },
    {
      name: '@brand_account',
      importedAt: new Date(2024, 10, 22), // Today
      importedBy: 'Bob White',
    },
  ],
  email_accounts: [
    {
      name: 'marketing@company.com',
      importedAt: new Date(2024, 10, 16), // 6 days ago
      importedBy: 'Sam Green',
    },
    {
      name: 'support@company.com',
      importedAt: new Date(2024, 10, 19), // 3 days ago
      importedBy: 'Emma Black',
    },
  ],
}

export const pendingIntegrations = [
  {
    name: 'Pending Integration #1',
    createdAt: new Date(),
    expiredAt: new Date(),
  },
  {
    name: 'Pending Integration #2',
    createdAt: new Date(),
    expiredAt: new Date(),
  },
  {
    name: 'Pending Integration #3',
    createdAt: new Date(),
    expiredAt: new Date(),
  },
]
