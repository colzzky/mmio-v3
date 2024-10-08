import { useServicesStore } from './servicesStore'
import type { Service } from '@/modules/meta/routes'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export interface Platform {
  name: string
  desc: string
  href: string
  icon: string
  services?: Map<string, Service>
}
export interface ProjectCenterDialog {
  isOpen: boolean
  isLoading: boolean
  activePage: 'platforms' | 'services' | 'chooseAPage'
  active_platform: Platform | null
  openProjectCenter(): void
  choosePlatform(platform: Platform): void
  choosePage(): void
  returnToPlaforms(): void
  close(): void
}

export const useProjectCenter = defineStore('projectCenter', () => {
  const { services } = useServicesStore()

  const platforms: Platform[] = [
    {
      name: 'Meta',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
      href: '#',
      icon: 'bxl-meta',
      services: services.meta,
    },
    {
      name: 'Email Marketing',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
      href: '#',
      icon: 'bx-envelope',
    },
    {
      name: 'Google My Business',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
      href: '#',
      icon: 'bxl-google',
    },
    {
      name: 'Whatsapp',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
      href: '#',
      icon: 'bxl-whatsapp',
    },
    {
      name: 'SMS Marketing',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
      href: '#',
      icon: 'bx-message-rounded',
    },
    {
      name: 'E-Commerce',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
      href: '#',
      icon: 'bx-shopping-bag',
    },
    {
      name: 'OmniChannel',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
      href: '#',
      icon: 'bx-group',
    },
  ]
  const project_center_dialog = reactive<ProjectCenterDialog>({
    isOpen: false,
    isLoading: false,
    activePage: 'platforms',
    active_platform: null,
    openProjectCenter() {
      if (!this.isOpen) {
        this.isOpen = true
        this.activePage = 'platforms'
      }
    },
    choosePlatform(platform: Platform) {
      this.isLoading = true
      this.active_platform = platform
      this.activePage = 'services'
      this.isLoading = false
    },
    choosePage() {
      this.isLoading = true
      this.activePage = 'chooseAPage'
      this.isLoading = false
    },
    returnToPlaforms() {
      this.isLoading = true
      this.active_platform = null
      this.activePage = 'platforms'
      this.isLoading = false
    },
    close() {
      if (this.isOpen) {
        this.isOpen = false
        this.activePage = 'platforms'
        this.isLoading = false
        this.active_platform = null
      }
    },
  })
  return {
    platforms,
    project_center_dialog,
  }
})
