var Sheet = null;
(function($){
    Sheet = {
        _previewTemplate: $('#preview-template').html(),
        _blockTemplate: $('#block-template').html(),
        _dragData: null,

        addPreview: function(preview_id, target) {
            var self = this;
            var preview = $('#' + preview_id);

            if(preview) {
                preview.removeClass('display-none');
                self.enablePreviewReordering(preview);
                preview.appendTo(target);
            }
        },

        enablePreviewReordering: function(view) {
            var self = this;

            view.off();

            view.find('.btn-collapse').on('click', function(e){
                if(!view.hasClass('display-none')) {
                    view.addClass('display-none');
                }

                view.find('.btn-collapse').off();
                self.showItem(view.attr('id'));
            });

            view.on('dragstart', function(e){
                e.stopPropagation();
                self._dragData = {"preview-jQ": view};
                $(e.currentTarget).css('opacity', 0.4);
            });

            view.on('dragend', function(e){
                e.preventDefault();
                e.stopPropagation();
                var dragged = $(e.currentTarget);
                dragged.css('opacity', 1.0);
                dragged.removeClass('over');
            });

            view.on('dragover', function(e){
                e.preventDefault();
                e.stopPropagation();
                $(e.currentTarget).addClass('over');
            });

            view.on('dragleave', function(e){
                e.preventDefault();
                e.stopPropagation();
                $(e.currentTarget).removeClass('over');
            });

            view.on('drop', function(e){
                e.preventDefault();
                e.stopPropagation();
                var dropped = $(e.currentTarget);
                dropped.removeClass('over');

                if(!self._dragData) {
                    return;
                }

                var dragged = self._dragData['preview-jQ'];
                var data_id = self._dragData['data-id'];
                var preview_id = self._dragData['preview-id'];
                self._dragData = null;

                if(data_id === undefined) {
                    // dragged not from left column
                    if(!dragged || dragged[0] === dropped[0]) {
                        // not target or drop on the same position
                        return;
                    }

                    if(dragged) {
                        // dragged from center column
                        dropped.before(dragged);
                        return;
                    }

                    return;
                }

                // dragged from left column
                var preview = $('#' + preview_id);
                preview.removeClass('display-none');
                dropped.before(preview);
                self.enablePreviewReordering(preview);
                self.hideItem(preview_id);
            });
            
            return view;
        },

        hideItem: function(preview_id) {
            var block = $("#ui-blocks").find(".sheet-block-item-bk[preview-id='" + preview_id + "']");
            block.attr('draggable', 'false');
            block.css({'background-color': '#ebebeb', cursor: 'default'});
            block.find('.sheet-block-item-text').addClass('z-bottom');
        },

        showItem: function(preview_id) {
            var block = $("#ui-blocks").find(".sheet-block-item-bk[preview-id='" + preview_id + "']");
            block.attr('draggable', 'true');
            block.css({'background-color': '#c9e653', cursor: 'pointer'});
            block.find('.sheet-block-item-text').removeClass('z-bottom');
        },

        enableBlockDragging: function() {
            var self = this;

            $(document).on('dragstart', '.sheet-block-item-bk', function(e) {
                e.stopPropagation();
                console.log('drag start');
                var block = $(e.currentTarget);
                e.originalEvent.dataTransfer.setData("text", "stupid fox");
                block.css('opacity', 0.4);
                if(block.attr('data-id') !== undefined && block.attr('data-id') !== false) {
                    self._dragData = {
                        'data-id': block.attr('data-id'),
                        'preview-id': block.attr('preview-id'),
                        'preview-title': block.find('.sheet-block-item-text').text()
                    };
                }
            });

            $(document).on('dragend', '.sheet-block-item-bk', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('drag end');
                $(e.currentTarget).css('opacity', 1.0);
            });

            $(document).on('dragover', '#div-preview', function(e) {
                e.preventDefault();
                e.stopPropagation();
            });

            $(document).on('drop', '#div-preview', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('dropped');
                if(!self._dragData) {
                    return;
                }

                var data_id = self._dragData['data-id'];
                var preview_id = self._dragData['preview-id'];
                self._dragData = null;
                
                if(data_id !== undefined) {
                    self.addPreview(preview_id, e.currentTarget);
                    self.hideItem(preview_id);
                }
            });
        },

        initFields: function() {
            data = [
                {
                    data_id: 'Abigail',
                    preview_id: 'preview-Abigail',
                    block_title: 'Abigail Williams'
                },
                {
                    data_id: 'Illya',
                    preview_id: 'preview-Illya',
                    block_title: 'Illya Von Einzbern'
                },
                {
                    data_id: 'BB',
                    preview_id: 'preview-BB',
                    block_title: 'BB Channel'
                }
            ];
            var left = $('#ui-blocks').find('.sheet-block-body')[0];
            var center = $('#div-preview')[0];
            for(var key in data) {
                var block = $(Mustache.render(this._blockTemplate, 
                    {
                        data_id: data[key]['data_id'], 
                        block_title: data[key]['block_title'],
                        preview_id: data[key]['preview_id']
                    }
                ));
                block.appendTo(left);

                var preview = $(Mustache.render(this._previewTemplate, 
                    {
                        data_id: data[key]['data_id'], 
                        preview_title: data[key]['block_title'],
                        preview_id: data[key]['preview_id']
                    }
                ));
                preview.appendTo(center);
            }
        },

        init: function() {
            Mustache.parse(this._previewTemplate);
            Mustache.parse(this._blockTemplate);
            this.initFields();
            this.enableBlockDragging();
        }
        
    };

    Sheet.init();
})(jQuery);