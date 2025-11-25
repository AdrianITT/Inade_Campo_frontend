import { useEffect, useContext, useRef } from "react";
import { UNSAFE_NavigationContext, useLocation, useBlocker } from "react-router-dom";

export function useBeforeUnload(shouldWarn) {
     useEffect(() => {
          const handleBeforeUnload = (event) => {
               if (shouldWarn) {
                    event.preventDefault();
                    event.returnValue = ""; // Necesario para algunos navegadores
               }
          };
          
          window.addEventListener("beforeunload", handleBeforeUnload);
          
          return () => {
               window.removeEventListener("beforeunload", handleBeforeUnload);
          };
     }, [shouldWarn]);
}

export function useNavigationPrompt(when, message = "¿Deseas salir sin guardar los cambios?") {
     
     const navigator = useContext(UNSAFE_NavigationContext).navigator;
     const location = useLocation();
     const lastPath = useRef(location.pathname);

const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmLeave = window.confirm(message);
      if (confirmLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker, message]);

    useEffect(() => {
      if (!when) return;

      const push = navigator.push;
      const replace = navigator.replace;

      navigator.push = (...args) => {
        if (window.confirm(message)) {
          push(...args);
        }
      };

      navigator.replace = (...args) => {
        if (window.confirm(message)) {
          replace(...args);
        }
      };

      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = message;
        return message;
      };

      // window.addEventListener("beforeunload", handleBeforeUnload);

     // Intercepta las flechas del navegador (popstate)
    // const handlePopState = (e) => {
    //   // Bloquear la navegación inmediatamente
    //   window.history.pushState(null, "", location.pathname);
      
    //   // Mostrar confirmación
    //   const confirmLeave = window.confirm(message);
      
    //   if (confirmLeave) {
    //     // Si confirma, permitir la navegación hacia atrás
    //     window.history.back();
    //   }
    //   // Si cancela, ya estamos en la ruta correcta (la actual)
    // };
    // window.history.pushState(null, "", location.pathname);
    window.addEventListener("beforeunload", handleBeforeUnload);
    // window.addEventListener("popstate", handlePopState);
    

      return () => {
          navigator.push = push;
          navigator.replace = replace;
          window.removeEventListener("beforeunload", handleBeforeUnload);
          // window.removeEventListener("popstate", handlePopState);
      };
    }, [when, navigator, message]);

  }

  export function useFormNavigationGuard(when, message = "¿Deseas salir sin guardar los cambios?") {
  const navigator = useContext(UNSAFE_NavigationContext).navigator;

  useEffect(() => {
    if (!when) return;

    const push = navigator.push;
    const replace = navigator.replace;

    // Intercepta navegación dentro de la app
    navigator.push = (...args) => {
      if (window.confirm(message)) push(...args);
    };
    navigator.replace = (...args) => {
      if (window.confirm(message)) replace(...args);
    };

    // Intercepta cierre de pestaña o navegador


    // Intercepta las flechas del navegador (popstate)
    const handlePopState = (e) => {
      const confirmLeave = window.confirm(message);
      if (!confirmLeave) {
        // Forzar mantener la ruta actual
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      navigator.push = push;
      navigator.replace = replace;

      window.removeEventListener("popstate", handlePopState);
    };
  }, [when, navigator, message]);
}