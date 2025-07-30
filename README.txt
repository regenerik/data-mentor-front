Se instala con : npm install

Instalé tmb: 
    npm install flux
    npm install --save-dev @types/flux

Se ejecuta con : npm run dev



Tips : 

1 - PARA AGREGAR ICONOS NUEVOS: 

En lucide-react.d.ts hay que agregar algo parecido a esto : 


    /**
    * @component @name Logout
    * @description Lucide SVG icon component, renders SVG Element with children.
    *
    * @preview ![img](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTUgMy41djMuMWE4IDggMCAxIDEgMCAxMXYzLjFNMjEgMTJINW0wIDBoMCIvPjwvc3ZnPg==) - https://lucide.dev/icons/log-out
    * @see https://lucide.dev/icons/log-out - Documentation
    *
    * @param {Object} props - Lucide icons props and any valid SVG attribute
    * @returns {JSX.Element} JSX Element
    */
    declare const Logout: react.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & react.RefAttributes<SVGSVGElement>>;


Y en el mismo archivo un poco mas abajo la exportacion que es algo asi  :

    declare const index_Logout: typeof Logout;

Y por último no olvidarse de importarlo en el componente

------------------------------------------------------------------------------------------------------------------------------------------

Si no te esta navegando desde la url en render.com hace lo siguiente ( ya lo hice acá ):


Entrás al panel de tu sitio en Render.com

Bajás a la sección Redirects/Rewrites

Hacés click en "Add Rewrite Rule"

Y agregás esta regla:

Source	Destination	    Type
/*	    /index.html	    Rewrite