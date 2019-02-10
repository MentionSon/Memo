;(function() {
    'use strict';

    var Event = new Vue();

    function copy(obj) {
        return Object.assign({}, obj);
    }

    Vue.component('task', {
        template: '#task-tpl',
        props: ['todo'],
        methods: {
            action: function(name, params) {
                Event.$emit(name, params);
            }
        }
    });

    new Vue({
        el: '#main',
        data: {
            list: [],
            lastId: 0,
            current: {
                /* title: '...',
                completed: false,
                desc: '...',
                remindAt: '2020-10-1', */
            }
        },

        mounted: function() {
            var me = this;
            this.list = ms.get('list') || this.list;
            this.lastId = ms.get('lastId') || this.lastId;
    
            setInterval(function() {
                me.checkAlerts();
            },3000);

            Event.$on('remove', function(id) {
                if (id) {
                    me.remove(id);
                }
            });
            Event.$on('toggleComplete', function(id) {
                if (id) {
                    me.toggleComplete(id);
                }
            });
            Event.$on('setCurrent', function(todo) {
                if (todo) {
                    me.setCurrent(todo);
                }
            });
            Event.$on('toggleDetail', function(id) {
                if (id) {
                    me.toggleDetail(id);
                }
            });
        },

        methods: {
            checkAlerts: function() {
                var me = this;
                this.list.forEach(function(row, i) {
                    var rTiming = row.remindTiming;
                    if (!rTiming || row.remindConfirmed) return;
                    
                    rTiming = (new Date(rTiming)).getTime();
                    var cTiming = (new Date()).getTime();

                    if (cTiming >= rTiming) {
                        var confirmed = confirm(row.title);
                        Vue.set(me.list[i], 'remindConfirmed', confirmed);
                    }
                });
            },

            merge: function() {
                var isUpdate, id;
                isUpdate = id = this.current.id;
                if (isUpdate) {
                    var index = this.find_index_by_id(id);
                    Vue.set(this.list, index, copy(this.current));
                    console.log(this.list);
                } else {
                    var title = this.current.title;
                    if(!title && title !== 0) return;

                    var todo = copy(this.current);
                    
                    this.lastId ++;
                    ms.set('lastId', this.lastId)
                    todo.id = this.lastId;
                    this.list.push(todo);               
                }  
                
                this.resetCurrent();
            },
            
            remove: function(id) {
                var index = this.find_index_by_id(id);
                this.list.splice(index, 1);
            },

            setCurrent: function(todo) {
                this.current = copy(todo);
            },

            resetCurrent: function() {
                this.setCurrent({});
            },

            toggleDetail: function(id) {
                var index = this.find_index_by_id(id);
                Vue.set(this.list[index], 'showDetail', !this.list[index].showDetail)
            },

            find_index_by_id: function(id) {
                return this.list.findIndex(function(item) {
                    return item.id === id;
                });
            },

            toggleComplete: function(id) {
                var i = this.find_index_by_id(id);
                Vue.set(this.list[i], 'completed', !this.list[i].completed);
            }
        },

        watch: {
            list: {
                deep: true,
                handler: function(n, o) {
                    if (n) {
                        ms.set('list', n);
                    } else {
                        ms.set('list', []);
                    }
                }
            }
        }
    });
})();