import { IApi } from "umi";

export default (api: IApi) => {
  api.modifyHTML(($) => {
    return $;
  });
  api.addHTMLStyles(() => [`body { margin: 0; }`]);
};
