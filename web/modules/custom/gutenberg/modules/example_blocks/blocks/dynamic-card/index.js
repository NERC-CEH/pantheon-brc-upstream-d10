/**
 * Example block to demonstrate dynamic blocks.
 * It uses the same edit component as the card block.
 * 
 * @see blocks/card/edit.js
 * @see templates/gutenberg-block--example-blocks--dynamic-card.html.twig
 */

import metadata from "./block.json";
import Edit from "../card/edit";
import IconCard from "./icon";
import "./style.scss";

const DynamicCard = {
  ...metadata,
  icon: IconCard,
  edit: Edit,
};

export default DynamicCard;