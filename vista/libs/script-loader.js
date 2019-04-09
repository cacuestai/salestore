/**
 *  Esperar a que se cargue un script antes de hacer algo con él.
 *  https://dev.to/timber/wait-for-a-script-to-load-in-javascript-579k
 * 
 *  Ejemplo de uso:
 *    const loader = new Loader({
 *       src: 'cdn.segment.com/analytics.js',
 *       global: 'Segment',
 *   })
 *
 *   // scriptToLoad ahora será una referencia a `window.Segment`
 *   const scriptToLoad = await loader.load()
 */

'use strict';

export default class ScriptLoader {
    constructor(options) {
        const { src, global, protocol = document.location.protocol } = options
        this.src = src
        this.global = global
        this.protocol = protocol
        this.isLoaded = false
    }

    loadScript() {
        return new Promise((resolve, reject) => {
            // Crear el elemento script y establecer sus atributos
            const script = document.createElement('script')
            script.type = 'text/javascript'
            script.async = true
            script.src = `${this.protocol}//${this.src}`

            // Agregar el script al DOM
            const el = document.getElementsByTagName('script')[0]
            el.parentNode.insertBefore(script, el)

            // Resuelve la promesa una vez que el script esté cargado
            script.addEventListener('load', () => {
                this.isLoaded = true
                resolve(script)
            })

            // Atrapa cualquier error al cargar el script
            script.addEventListener('error', () => {
                reject(new Error(`${this.src} failed to load.`))
            })
        })
    }

    load() {
        return new Promise(async(resolve, reject) => {
            if (!this.isLoaded) {
                try {
                    await this.loadScript()
                    resolve(window[this.global])
                } catch (e) {
                    reject(e)
                }
            } else {
                resolve(window[this.global])
            }
        })
    }
}