/// <reference types="react" />
import { EditorProps } from './interfaces';
import './Editor.scss';
declare const Editor: ({ size, alert, value, onChange, imageUploadUrl, onImageUpload, init, ...rest }: EditorProps) => JSX.Element;
export default Editor;
