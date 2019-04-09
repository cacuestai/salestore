/*
    Carga de scripts Versión 0.1
    Autor: carlos.cuesta@ucaldas.edu.co
    Descripción: por ahora se proporcionan dos funciones, una para cargar páginas HTML completas
    y otra para el uso de la función $(...) con el fin de facilitar el acceso a elementos del DOM
*/

'use strict';

(() => {

    /**
     * Establece en un elemento dado el HTML recuperado de una URL y luego ejecuta los posibles 
     * scripts JS referenciados o incluidos en el HTML.
     * Opcionalmente ejecuta un callBack cuando se termina la carga de la página.
     */
    Element.prototype.cargar = function(url, callBack) {
        let self = this;
        getHTML(url).then(html => {
            self.innerHTML = html;
            cargarScripts(html);
            if (callBack) {
                callBack(self);
            }
        }).catch(error => {
            util.mensaje(error, 'Falló la carga del recurso');
        });
    }

    /**
     * Retorna el HTML de la página o sección de página especificada como argumento
     * @param {String} url La dirección donde se encuentra la página o sección de página a cargar
     */
    let getHTML = async(url) => {
        // se verifica si la url dada apunta a una sección de la página
        let seccion;
        let i = url.indexOf('#');
        if (i > -1) { // no es una página completa, es una sección de la página
            seccion = url.substr(i); // obtiene la sección
            url = url.substr(0, i); // obtiene la dirección de la página
        }

        // intentar recuperar la página html
        let respuesta = await fetch(url);
        if (respuesta.ok) {
            let contenido = await respuesta.text();
            if (seccion) {
                // analiza gramaticalmente el contenido recibido y lo convierte en un objeto Document
                let documentoHTML = (new DOMParser()).parseFromString(contenido, "text/html, text/css, text/javascript");
                // obtiene la sección elegida del documento 
                contenido = documentoHTML.querySelector(seccion).innerHTML;
            }
            return contenido;
        } else {
            throw new Error(`${respuesta.status}: ${respuesta.statusText}\n${respuesta.url}`);
        }
    }

    /**
     * Analiza los script JS incluidos en un HTML y los carga en la cabecera del documento actual
     * Ver: https://help.oclc.org/Metadata_Services/CONTENTdm/Advanced_website_customization/Customization_cookbook/Load_multiple_JavaScript_files
     * @param {String} html 
     */
    let cargarScripts = (html) => {
        let doc = (new DOMParser()).parseFromString(html, "text/html");
        // parser para cada uno de los script de la página (se admiten otros selectores: 'head > script' | 'head > link')
        doc.querySelectorAll("script").forEach(script => {
            let objScript = document.createElement('script');
            if (script.type && script.type === 'module') {
                objScript.setAttribute("type", "module");
            } else {
                objScript.setAttribute("type", "text/javascript");
            }
            objScript.setAttribute("src", script.src);
            const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
            head.insertBefore(objScript, head.lastChild);
        });
    }

    /**
     * Supuestamente carga un script
     * *** falta probar su funcionamiento ***
     * @param {String} url 
     */
    let cargarScript = (url) => {
        let script = document.createElement("script");
        script.src = url;
        document.head.appendChild(script);
    }

    /**
     * Permite usar el identificador $ como nombre de la función querySelector o querySelectorAll
     * Si se proporciona un segundo argumento true, se usa querySelectorAll, si no, se usa querySelector
     */
    window.$ = (selector, all = false) => {
        if (all) {
            return document.querySelectorAll(selector);
        } else {
            return document.querySelector(selector);
        }
    };

})();