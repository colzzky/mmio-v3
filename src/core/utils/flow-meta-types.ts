/////////////////////////
// Facebook Templates //
///////////////////////

export namespace FBAttachmentTemplate {


    export interface Attachment {
        attachment: {
            type: 'template'
            payload: CarouselTemp | ButtonTemp
        }
    }

    export interface CarouselTemp {
        payload: {
            template_type: 'generic'
            elements: Element[]
        }
    }

    export interface MessageTemp {
        payload: {
            template_type: 'generic'
            elements: Element[]
        }
    }

    export interface ButtonTemp {
        payload: {
            template_type: 'button'
            text: string
            buttons?: Button[]
        }
    }







    export interface Element {
        title: string
        subtitle?: string
        image_url?: string
        default_action?: DefaultAction,
        buttons?: Button[]
    }

    export interface DefaultAction {
        type: string
        url: string
        messenger_extensions: "TRUE" | "FALSE"
        webview_height_ratio: "COMPACT" | "TALL" | "FULL"
    }

    export interface Button {
        type: 'web_url' | 'postback'
        title: string
        url?: string // Optional because 'postback' type doesn't require it
        messenger_extensions?: "TRUE" | "FALSE" // Optional for web_url type
        payload?: string // Optional because 'web_url' doesn't need payload
    }
}
