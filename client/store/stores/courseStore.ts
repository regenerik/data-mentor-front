import { EventEmitter } from "../../lib/EventEmitter";
import dispatcher, { FluxAction } from "../dispatcher";
import { CourseActionTypes } from "../constants/courseConstants";

// Define la interfaz para el estado de tu curso
export interface CourseState {
  editorContent: string | null;
  editorTitle: string | null;
  sharePdf: {
    blob: Blob | null;
    fileName: string | null;
    objectUrl: string | null; // útil para preview <iframe>
  };
}

class CourseStore extends EventEmitter {
  private state: CourseState = {
    editorContent: "Bienvenido. Este es un ejemplo de curso seleccionado.",
    editorTitle: null,
    sharePdf: { blob: null, fileName: null, objectUrl: null }, 
  };

  getState(): CourseState {
    return { ...this.state };
  }

  getEditorContent(): string | null {
    return this.state.editorContent;
  }

  getEditorTitle(): string | null {
    return this.state.editorTitle;
  }

  getSharePdf() {
    return this.state.sharePdf;
  }

  private setState(newState: Partial<CourseState>) {
    this.state = { ...this.state, ...newState };
    this.emit("change");
  }

  private handleAction(action: FluxAction) {
    switch (action.type) {
      case CourseActionTypes.SET_EDITOR_CONTENT:
        this.setState({
          editorContent: action.payload.content,
          editorTitle: action.payload.title,
        });
        break;

      // ➕ guarda blob + URL
      case CourseActionTypes.SET_SHARE_PDF: {
        // revocá la URL anterior si existía
        const prevUrl = this.state.sharePdf.objectUrl;
        if (prevUrl) URL.revokeObjectURL(prevUrl);

        const objectUrl = URL.createObjectURL(action.payload.blob);
        this.setState({
          sharePdf: {
            blob: action.payload.blob,
            fileName: action.payload.fileName,
            objectUrl,
          },
        });
        break;
      }

      // ➕ limpia
      case CourseActionTypes.CLEAR_SHARE_PDF: {
        const prevUrl = this.state.sharePdf.objectUrl;
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        this.setState({
          sharePdf: { blob: null, fileName: null, objectUrl: null },
        });
        break;
        }
      default:
        break;

    }
  }

  addChangeListener(callback: () => void) {
    this.on("change", callback);
  }

  removeChangeListener(callback: () => void) {
    this.removeListener("change", callback);
  }
}

const courseStore = new CourseStore();

// Registra el store con el dispatcher para que escuche las acciones
dispatcher.register((action: FluxAction) => {
  courseStore["handleAction"](action);
});

export default courseStore;