import { Editor } from "@tinymce/tinymce-react";

// TinyMCE so the global var exists
import "tinymce/tinymce";
// DOM model
import "tinymce/models/dom/model";
// Theme
import "tinymce/themes/silver";
// Toolbar icons
import "tinymce/icons/default/";
// Editor styles
import "tinymce/skins/ui/oxide/skin";

// importing the plugin js.
// if you use a plugin that is not listed here the editor will fail to load
import "tinymce/plugins/advlist";
import "tinymce/plugins/anchor";
import "tinymce/plugins/autolink";
import "tinymce/plugins/autoresize";
import "tinymce/plugins/autosave";
import "tinymce/plugins/charmap";
import "tinymce/plugins/code";
import "tinymce/plugins/codesample";
import "tinymce/plugins/directionality";
import "tinymce/plugins/emoticons";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/help";
import "tinymce/plugins/help/js/i18n/keynav/en";
import "tinymce/plugins/image";
import "tinymce/plugins/importcss";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/media";
import "tinymce/plugins/nonbreaking";
import "tinymce/plugins/pagebreak";
import "tinymce/plugins/preview";
import "tinymce/plugins/quickbars";
import "tinymce/plugins/save";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/table";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/visualchars";
import "tinymce/plugins/wordcount";

// importing plugin resources
import "tinymce/plugins/emoticons/js/emojis";

// Content styles, including inline UI like fake cursors

export default function BundledEditor({ value, onChange, onInit }) {
  return (
    <Editor
      licenseKey="gpl"
      onInit={onInit}
      init={{
        height: 0.3 * window.innerHeight,
        menubar: false,
        plugins: [
          "advlist",
          "anchor",
          "autolink",
          "link",
          "lists",
          "searchreplace",
          "table",
          "wordcount",
          "code",
          "directionality",
          "media",
          "preview",
          "image",
          "emoticons",
        ],
        toolbar:
          "undo redo | blocks | " +
          "bold italic underline forecolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "code directionality media table preview image emoticons",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
      }}
    />
  );
}
