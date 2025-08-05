// src/components/ImageEditorModal.js
import React, { useEffect, useRef } from "react";
import ImageEditor from "tui-image-editor";
import "tui-image-editor/dist/tui-image-editor.css";
import "./custom-tui-overrides.css"
import { Modal } from "antd";

const ImageEditorModal = ({ visible, imageSrc, onSave, onCancel }) => {
  const editorRef = useRef(null);
  let instance = useRef(null);
      const customTheme = {
    'colorpicker.button.border': '#fff',
    'colorpicker.title.color': '#fff',
    'colorpicker.input.border': '#fff',
    'colorpicker.input.backgroundColor': '#000',
    'colorpicker.input.color': '#fff',
    'colorpicker.button.color': '#fff',
    'colorpicker.button.active.color': '#ffa500',


  };

  useEffect(() => {
    if (visible && imageSrc && editorRef.current) {
      instance.current = new ImageEditor(editorRef.current, {
        includeUI: {
          loadImage: {
            path: imageSrc,
            name: "imagen",
          },
          theme:customTheme,
          menu: ["crop", "flip", "rotate", "draw", "shape", "text", "filter"],
          initMenu: "",
          uiSize: {
            width: "1000px",
            height: "700px",
          },
          menuBarPosition: "bottom",
        },
        cssMaxWidth: 700,
        cssMaxHeight: 500,
        selectionStyle: {
          cornerSize: 20,
          rotatingPointOffset: 70,
        },
      });
    }

    return () => {
      if (instance.current) {
        instance.current.destroy();
        instance.current = null;
      }
    };
  }, [visible, imageSrc]);

  const handleSave = async () => {
    if (instance.current) {
      const dataUrl = instance.current.toDataURL();
      onSave(dataUrl); // base64 de la imagen editada
    }
  };

  return (
    <Modal
      title="Editar Imagen"
      open={visible}
      onOk={handleSave}
      onCancel={onCancel}
      width={1050}
    >
      <div ref={editorRef} />
    </Modal>
  );
};

export default ImageEditorModal;