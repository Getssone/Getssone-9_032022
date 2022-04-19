import eyeBlueIcon from "../assets/svg/eye_blue.js"
// import downloadBlueIcon from "../assets/svg/download_blue.js"

//Rajout de File Name pour indiqué quel est le fichier visualisé
export default (billUrl,fileName) => {
  return (
    `<div class="icon-actions">
      <div id="eye" data-testid="icon-eye" data-bill-url=${billUrl}>
      ${eyeBlueIcon}
      <div>${(fileName !== null) ? "": 'Pas d\'image'}</div>
      </div>
    </div>`
  )
}