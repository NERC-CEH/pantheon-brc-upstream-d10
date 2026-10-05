import { registerBlockType } from "@wordpress/blocks";
import Card from "./card";
import DynamicCard from "./dynamic-card";

registerBlockType("example-blocks/card", Card);
registerBlockType("example-blocks/dynamic-card", DynamicCard);
