import dispatcher from "../dispatcher";
import { CourseActionTypes } from "../constants/courseConstants";

interface EditorContentPayload {
  content: string;
  title: string;
}

export const courseActions = {
  setEditorContent: (content: string, title?: string | null) => {
    dispatcher.dispatch({
      type: CourseActionTypes.SET_EDITOR_CONTENT,
      payload: { content, title: title ?? null },
    });
  },
    // ➕ guardar el PDF para la pantalla /share
  setSharePdf: (blob: Blob, fileName: string) => {
    dispatcher.dispatch({
      type: CourseActionTypes.SET_SHARE_PDF,
      payload: { blob, fileName },
    });
  },

  // ➕ limpiar cuando termines de usarlo
  clearSharePdf: () => {
    dispatcher.dispatch({ type: CourseActionTypes.CLEAR_SHARE_PDF });
  },
};