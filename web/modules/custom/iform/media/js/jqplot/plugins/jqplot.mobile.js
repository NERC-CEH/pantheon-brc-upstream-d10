/**
 * jqplot.jquerymobile plugin
 * jQuery Mobile virtual event support.
 *
 * Version: 1.0.9
 * Revision: d96a669
 *
 * Copyright (c) 2011 Takashi Okamoto
 * jqPlot is currently available for use in all personal or commercial projects
 * under both the MIT (http://www.opensource.org/licenses/mit-license.php) and GPL
 * version 2.0 (http://www.gnu.org/licenses/gpl-2.0.html) licenses. This means that you can
 * choose the license that best suits your project and use it accordingly.
 *
 * Although not required, the author would appreciate an email letting him
 * know of any substantial use of jqPlot.  You can reach the author at:
 * chris at jqplot dot com or see http://www.jqplot.com/info.php .
 *
 * If you are feeling kind and generous, consider supporting the project by
 * making a donation at: http://www.jqplot.com/donate.php .
 *
 */
(function($) {
    function postInit(target, data, options){
        this.bindCustomEvents = function() {
            this.eventCanvas._elem.on('vclick', {plot:this}, this.onClick);
            this.eventCanvas._elem.on('dblclick', {plot:this}, this.onDblClick);
            this.eventCanvas._elem.on('taphold', {plot:this}, this.onDblClick);
            this.eventCanvas._elem.on('vmousedown', {plot:this}, this.onMouseDown);
            this.eventCanvas._elem.on('vmousemove', {plot:this}, this.onMouseMove);
            this.eventCanvas._elem.on('mouseenter', {plot:this}, this.onMouseEnter);
            this.eventCanvas._elem.on('mouseleave', {plot:this}, this.onMouseLeave);
            if (this.captureRightClick) {
                this.eventCanvas._elem.on('vmouseup', {plot:this}, this.onRightClick);
                this.eventCanvas._elem.get(0).oncontextmenu = function() {
                    return false;
                };
            }
            else {
                this.eventCanvas._elem.on('vmouseup', {plot:this}, this.onMouseUp);
            }
        };
        this.plugins.mobile = true;
    }
    $.jqplot.postInitHooks.push(postInit);
})(jQuery);