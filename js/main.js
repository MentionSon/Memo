;(function() {
    'use strict';

    var Event = new Vue();

    function copy(obj) {
        return Object.assign({}, obj);
    }

    /* 备忘清单条目的组件注册 */
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
            
            // 从 localStorage 中获取备忘清单数据
            this.list = ms.get('list') || this.list;
            this.lastId = ms.get('lastId') || this.lastId;
    
            /* 检测用于提示的时间戳 */
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
            /* 检测提示时间戳 */
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

            /* 检测输入框状态，跟新清单数据 */
            merge: function() {
                var isUpdate, id;
                isUpdate = id = this.current.id;
                if (isUpdate) {
                    var index = this.find_index_by_id(id);
                    Vue.set(this.list, index, copy(this.current));
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
            
            /* 删除清单条目 */
            remove: function(id) {
                var index = this.find_index_by_id(id);
                this.list.splice(index, 1);
            },

            /* 设置输入框状态 */
            setCurrent: function(todo) {
                this.current = copy(todo);
            },

            /* 重置输入框 */
            resetCurrent: function() {
                this.setCurrent({});
            },

            /* 清单细节显示 */
            toggleDetail: function(id) {
                var index = this.find_index_by_id(id);
                Vue.set(this.list[index], 'showDetail', !this.list[index].showDetail)
            },

            /* 查询清单索引 */
            find_index_by_id: function(id) {
                return this.list.findIndex(function(item) {
                    return item.id === id;
                });
            },

            /* 转换清单完成状态 */
            toggleComplete: function(id) {
                var i = this.find_index_by_id(id);
                Vue.set(this.list[i], 'completed', !this.list[i].completed);
            }
        },

        /* 监听 list 中的数据变化并推入到 localStorage中 */
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