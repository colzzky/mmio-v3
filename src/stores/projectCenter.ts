import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

export interface Service {
    name: string
    desc: string
    href: string
    icon: string
}
export interface Platform {
    name: string
    desc: string
    href: string
    icon: string
    services: Service[]
}
export interface ProjectCenterDialog {
    isOpen: boolean
    isLoading: boolean
    activePage: 'platforms'| 'services'| 'chooseAPage'| 'projectName',
    active_platform: Platform | null,
    openProjectCenter(): void
    choosePlatform(platform: Platform): void,
    returnToPlaforms():void
    close(): void,
}

export const useProjectCenter = defineStore('projectCenter', () => {
    const meta_services = <Service[]>[
        { name: 'Chatbot Flow Builder', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-network-chart" },
        { name: 'Comment Auto Reply', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-conversation" },
        { name: 'Chat Broadcast', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-broadcast", },
        { name: 'Live Chat', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-message-dots", },
        { name: 'Persistent Menu', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-food-menu", },
        { name: 'Marketing Messages', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-shopping-bag", },
        { name: 'Livestreams', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-video", },
        { name: 'Subscribers', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-group", },
        { name: 'Post Randomizer', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-repost", },
        { name: 'Interest Finder', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-file-find", },
        { name: 'Growth Tools', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-chart", },
        { name: 'Chat Sequence', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-comment-add", },
        { name: 'Messenger Webview', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-window-open", },
        { name: 'Welcome Message', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-chalkboard", },
        { name: 'Ice Breakers', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-wind", },
        { name: 'Get Started', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-star", },
        { name: 'Keywords', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-key", },
        { name: 'Chatbot Defaults', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-bot", },
    ]
    const platforms = <Platform[]>[
        { name: 'Meta', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bxl-meta", services: meta_services },
        { name: 'Email Marketing', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-envelope", services: [] },
        { name: 'Google My Business', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bxl-google", services: [] },
        { name: 'Whatsapp', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bxl-whatsapp", services: [] },
        { name: 'SMS Marketing', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-message-rounded", services: [] },
        { name: 'E-Commerce', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-shopping-bag", services: [] },
        { name: 'OmniChannel', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ', href: '#', icon: "bx-group", services: [] },
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
        returnToPlaforms(){
            this.isLoading = true
            this.active_platform = null
            this.activePage = 'platforms'
            this.isLoading = false
        },
        close() {
            if (this.isOpen) {
                this.isOpen = false;
                this.activePage = 'platforms'
                this.isLoading = false,
                this.active_platform = null;
            }
        },
    })
    return {
        meta_services,
        platforms,
        project_center_dialog
    }
})
