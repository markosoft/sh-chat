'use strict';

!function (a) { var b = !1; if ("function" == typeof define && define.amd && (define(a), b = !0), "object" == typeof exports && (module.exports = a(), b = !0), !b) { var c = window.Cookies, d = window.Cookies = a(); d.noConflict = function () { return window.Cookies = c, d } } }(function () { function a() { for (var a = 0, b = {}; a < arguments.length; a++) { var c = arguments[a]; for (var d in c) b[d] = c[d] } return b } function b(c) { function d(b, e, f) { var g; if ("undefined" != typeof document) { if (arguments.length > 1) { if (f = a({ path: "/" }, d.defaults, f), "number" == typeof f.expires) { var h = new Date; h.setMilliseconds(h.getMilliseconds() + 864e5 * f.expires), f.expires = h } try { g = JSON.stringify(e), /^[\{\[]/.test(g) && (e = g) } catch (a) { } return e = c.write ? c.write(e, b) : encodeURIComponent(String(e)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent), b = encodeURIComponent(String(b)), b = b.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent), b = b.replace(/[\(\)]/g, escape), document.cookie = [b, "=", e, f.expires ? "; expires=" + f.expires.toUTCString() : "", f.path ? "; path=" + f.path : "", f.domain ? "; domain=" + f.domain : "", f.secure ? "; secure" : ""].join("") } b || (g = {}); for (var i = document.cookie ? document.cookie.split("; ") : [], j = /(%[0-9A-Z]{2})+/g, k = 0; k < i.length; k++) { var l = i[k].split("="), m = l.slice(1).join("="); '"' === m.charAt(0) && (m = m.slice(1, -1)); try { var n = l[0].replace(j, decodeURIComponent); if (m = c.read ? c.read(m, n) : c(m, n) || m.replace(j, decodeURIComponent), this.json) try { m = JSON.parse(m) } catch (a) { } if (b === n) { g = m; break } b || (g[n] = m) } catch (a) { } } return g } } return d.set = d, d.get = function (a) { return d.call(d, a) }, d.getJSON = function () { return d.apply({ json: !0 }, [].slice.call(arguments)) }, d.defaults = {}, d.remove = function (b, c) { d(b, "", a(c, { expires: -1 })) }, d.withConverter = b, d } return b(function () { }) });

var SH_Chat = {

    init: function init(id_g, name_g, avatar_g, profile_g, email_g, color_g, security_g) {
        var path = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : '';
        var host = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : '';
        var port = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : '1337';
        var server_time = arguments.length > 10 && arguments[10] !== undefined ? new Date(arguments[10]) : new Date();
        var jQuery1_11_1 = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : $;

        var domain_level = 2;

        var php_path = path;
        if (php_path == '') {
            php_path = 'http://localhost/';
            domain_level = 1;
        }

        var tmp_domain = window.location.hostname.split('.');
        var domain = "";
        var start_iter = Math.max(tmp_domain.length - domain_level, 0);
        for (var i = start_iter; i < tmp_domain.length; i++) {
            if (i != start_iter) domain += ".";
            domain += tmp_domain[i];
        }

        var chat_main = "";
        var chat_window = "";
        var sent_msg = "";
        var recv_msg = "";
        var online_user = "";
        var sound = true;
        var connection = true;
        var title = document.title;
        var audio = new Audio(path + 'mp3/popup.mp3');
        var stop_propag = false;
        var socket = null;
        var unread = 0;
        var timer = null;
        var emoticonJSON = null;
        var emoticonKeys = [];
        var emoticonCustom = null;

        var events = [];


        var space = 5;
        var list_width = 0;//202;
        var list_right = 0;
        var window_width = 0;//232;
        var opened = [];
        var tmp_opened = [];

        var client_time = new Date();
        var diff = server_time.getTime() - client_time.getTime();

        var loadedMain = false;
        var loadedMain2 = false;
        var loadedConfirm = false;
        var loadedConnection = false;
        var dom_loaded = false;
        var ajax_loaded = false;
        var loadingEnded = false;

        var reject = false;

        var version = 3;

        var online_users = {};


        var holding_enter = false;
        var save_enter = "";

        var online_min = false;

        function load_cookies() {
            try {
                var cookie = Cookies.get('shchat').split('+');
                var main = cookie[0].split('-');

                var local_uid = main[0];
                var local_version = main[1];

                if (local_uid != id_g || local_version != version) throw null;

                if (main[2] == '1') connection = true;
                else connection = false;

                if (main[3] == '1') sound = true;
                else sound = false;

                if (main[4] == '1') online_min = true;
                else online_min = false;

                if (connection) {
                    for (var i = 1; i < cookie.length; i++) {
                        var tmp = cookie[i].split('-');
                        var min = false;
                        if (tmp.length == 2 && tmp[1] == '1') min = true;
                        tmp_opened.push({ id: tmp[0], min: min });
                    }
                }

            }
            catch (e) {
                opened = [];
                save_cookies();
            }

        }

        function save_cookies() {
            try {

                var tmp = id_g + '-' + version + '-';
                if (connection) tmp += '1-';
                else tmp += '0-';

                if (sound) tmp += '1-';
                else tmp += '0-';

                if (online_min) tmp += '1-';
                else tmp += '0-';

                for (var i = 0; i < opened.length; i++) {
                    tmp += '+' + opened[i].id;
                    if (opened[i].min) tmp += '-1';
                }

                Cookies.set('shchat', tmp, {
                    domain: domain,
                    expires: 365
                });
            }
            catch (e) {
            }
        }

        load_cookies();


        var is_search = false;

        jQuery1_11_1.get(path + "templates/chat-main.html", function (data) {
            chat_main = data;
            jQuery1_11_1.get(path + "templates/online-user.html", function (data) {
                online_user = data;
                jQuery1_11_1.get(path + "templates/chat-window.html", function (data) {
                    chat_window = data;
                    jQuery1_11_1.get(path + "templates/msg-sent.html", function (data) {
                        sent_msg = data;
                        jQuery1_11_1.get(path + "templates/msg-recv.html", function (data) {
                            recv_msg = data;
                            jQuery1_11_1.getJSON(path + "emoticon/emoticon.json", function (json) {
                                emoticonJSON = json.default;
                                emoticonCustom = json.custom;

                                for (var k in emoticonJSON) {
                                    var val = emoticonJSON[k];
                                    if (val.substr(0, 4).toLowerCase() != 'http') {
                                        val = path + 'emoticon/' + val;
                                        emoticonJSON[k] = val;
                                    }
                                    emoticonKeys.push(k);
                                }
                                emoticonKeys.sort(function (a, b) {
                                    // ASC  -> a.length - b.length
                                    // DESC -> b.length - a.length
                                    return b.length - a.length;
                                });

                                ajax_loaded = true;
                                if (dom_loaded) loadMainDOM();
                            });
                        });
                    });
                });
            });
        });

        jQuery1_11_1(document).ready(function () {
            dom_loaded = true;
            if (ajax_loaded) loadMainDOM();

        });

        function loadConnection() {
            if (host == '') socket = io();
            else socket = io.connect(host);

            socket.on('connect', function () {

                socket.emit('join', { 'uid': id_g, 'name': name_g, 'avatar': avatar_g, 'profile': profile_g, 'email': email_g, 'color': color_g, 'security': security_g, 'connection': connection });

                socket.on('confirm', function (recv) {


                    if (recv.op == 'reject') {
                        if (loadedMain) jQuery1_11_1('#shchat-main').remove();
                        reject = true;
                    }
                    else {

                        if (recv.first) {
                            var user = recv.user;
                            jQuery1_11_1.post(php_path + "php/ajax.php", { action: "add_user", 'uid': user.uid, 'username': user.name, 'avatar': user.avatar, 'profile': user.profile, 'color': user.color, name: name_g, email: email_g, security: security_g });

                            //console.log(user);
                        }
                        connection = recv.online;
                        loadedConnection = true;
                        if (loadedMain2) loadConfirmDOM();
                    }
                });

                socket.on('chat', function (recv) {
                    if (connection) {
                        var message = JSON.parse(recv);
                        if (loadingEnded) handle_incoming(message);
                        else events.push(message);
                    }
                });

                socket.on('self', function (recv) {
                    var message = JSON.parse(recv);
                    handle_self(message);
                });

            });
        }

        loadConnection();

        function loadMainDOM() {
            if (loadedMain) return;
            loadedMain = true;

            jQuery1_11_1('body').append(replaceAll(chat_main, '{path}', path));
            list_width = parseInt(jQuery1_11_1('#shchat-online-list').css('width'));
            list_right = parseInt(jQuery1_11_1('#shchat-online-list').css('right'));

            if (online_min) min_max('shchat-users', 'min', false, true);

            loadedMain2 = true;
            if (loadedConnection) loadConfirmDOM();
        }

        function loadConfirmDOM() {
            if (loadedConfirm) return;
            loadedConfirm = true;
            if (!reject) {
                connect_disconnect(connection, true);

                try {
                    if (tmp_opened.length > 0) jQuery1_11_1.post(php_path + "php/ajax.php", { action: "opened_chats", opened: tmp_opened, name: name_g, email: email_g, security: security_g }, function (data) {

                        for (var i = 0; i < data.length; i++) {
                            var t = data[i];
                            if (t.id && t.id == tmp_opened[i].id) {
                                var uid = t.id;
                                var name = t.username;
                                var avatar = t.avatar;
                                var profile = t.profile;

                                if (!open_chat(uid, name, avatar, profile, false, false, true)) read_history(uid);
                                if (tmp_opened[i].min) min_max('shchat-field-' + uid, 'min', false, true);
                            }
                        }

                    }, "json");
                }
                catch (e) {
                }


                mute_unmute(sound, true);

                for (var i = 0; i < events.length; i++) {
                    handle_incoming(events[i]);
                }
                loadingEnded = true;
            }

        }

        function replaceAll(str, find, replace) {
            return str.split(find).join(replace);
        }

        function escapeRegExp(str) {
            return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
        }

        function urlify(text) {
            var urlRegex = /(https?:\/\/[^\s]+)/g;
            return text.replace(urlRegex, function (url) {
                return '<a href="' + url + '">' + url + '</a>';
            })
        }

        function replaceJSON(str, json) {
            var ret = str;

            for (var i in json) {
                ret = replaceAll(ret, i, json[i]);
            }
            return ret;
        }

        function replaceEmoticon(str) {
            var ret = str;
            for (var c in emoticonCustom) {
                var prep_key = escapeRegExp(c);
                prep_key = replaceAll(prep_key, '\\*', '([A-Za-z0-9\-\_]+)');
                var prep_val = replaceAll(emoticonCustom[c], '*', '$1');
                var reg = new RegExp(prep_key, 'g');
                var m;
                do {
                    m = reg.exec(ret);
                    if (m) {
                        var find = m[0];
                        var repl = replaceAll(emoticonCustom[c], '*', m[1]);

                        ret = replaceAll(ret, ' ' + find, ' <img src="' + repl + '" alt="{key}" title="{key2}">');
                        if (ret.substr(0, find.length) == find) {
                            ret = ret.replace(find, '<img src="' + repl + '" alt="{key}" title="{key2}">');
                        }
                        ret = replaceAll(ret, '{key}', find);
                        ret = replaceAll(ret, '{key2}', m[1]);
                    }
                } while (m);
            }

            for (var i = 0; i < emoticonKeys.length; i++) {
                var key = emoticonKeys[i];
                ret = replaceAll(ret, ' ' + key, ' <img src="' + emoticonJSON[key] + '" alt="{key}">');
                ret = replaceAll(ret, ' ' + key.toLowerCase(), ' <img src="' + emoticonJSON[key] + '" alt="{key}">');
                ret = replaceAll(ret, ' ' + key.toUpperCase(), ' <img src="' + emoticonJSON[key] + '" alt="{key}">');

                if (ret.substr(0, key.length).toLowerCase() == key.toLowerCase()) {
                    ret = ret.replace(key, '<img src="' + emoticonJSON[key] + '" alt="{key}">');
                    ret = ret.replace(key.toLowerCase(), '<img src="' + emoticonJSON[key] + '" alt="{key}">');
                    ret = ret.replace(key.toUpperCase(), '<img src="' + emoticonJSON[key] + '" alt="{key}">');
                }

                ret = replaceAll(ret, '{key}', key);
            }
            return ret;
        }

        function handle_incoming(recv) {
            var action = recv.action;

            if (action == 'message') {

                var data = recv.data;

                var date_num = data.date;
                var date = new Date(data.date * 1000);
                var today = new Date();

                var dest_user = data.dest_user;
                var user_id = data.user.uid;
                var user_name = data.user.name;
                var user_avatar = data.user.avatar;
                var user_profile = data.user.profile;
                var msg = replaceEmoticon(urlify(data.msg));
                var seen = data.seen;

                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();

                var hour = date.getHours().toString();
                if (hour.length == 1) hour = '0' + hour;
                var minute = date.getMinutes().toString();
                if (minute.length == 1) minute = '0' + minute;

                var string_date = hour + ":" + minute;

                if (today.toDateString() !== date.toDateString()) string_date = day + "." + month + "." + year + ". " + string_date;

                var scrolled = true;

                var json_for_replace = {
                    '{date}': string_date,
                    '{msg}': msg,
                    '{name}': user_name,
                    '{uid}': user_id,
                    '{avatar}': user_avatar
                };

                var window = dest_user;
                var html = '';
                if (window == id_g) {
                    window = user_id;

                    var newchat = open_chat(user_id, user_name, user_avatar, user_profile, true, false, true);


                    //if (jQuery1_11_1('#shchat-msgs-' + window).scrollTop() + jQuery1_11_1('#shchat-msgs-' + window).innerHeight() + 10 >= jQuery1_11_1('#shchat-msgs-' + window)[0].scrollHeight) scrolled = true;

                    if (!seen) {
                        if (!jQuery1_11_1('#shchat-window-' + window).find('.shchat-header').hasClass('newmsg')) {
                            unread++;
                            document.title = "(" + unread + ") " + title;
                            jQuery1_11_1('#shchat-window-' + window).find('.shchat-header').addClass('newmsg');
                            jQuery1_11_1('#shchat-msgs-' + window).append('<hr/>');
                        }
                        if (sound) {
                            audio.play();
                        }
                    }

                    html = replaceJSON(recv_msg, json_for_replace);
                    jQuery1_11_1(html).hide().appendTo('#shchat-msgs-' + window).animate({ height: 'toggle', opacity: 'toggle' }, {
                        duration: 300,
                        step: function (now, fx) {
                            if (scrolled) scrollToBottom(jQuery1_11_1('#shchat-msgs-' + window));
                        }
                    });

                    if (jQuery1_11_1("#shchat-online-" + window).attr('src') == path + 'images/typing.png') jQuery1_11_1("#shchat-online-" + window).attr('src', path + 'images/online.png');

                    if (!newchat) read_history(window, date_num, msg);

                } else {
                    //if (jQuery1_11_1('#shchat-msgs-' + window).scrollTop() + jQuery1_11_1('#shchat-msgs-' + window).innerHeight() + 10 >= jQuery1_11_1('#shchat-msgs-' + window)[0].scrollHeight) scrolled = true;

                    html = replaceJSON(sent_msg, json_for_replace);
                    jQuery1_11_1(html).hide().appendTo('#shchat-msgs-' + window).animate({ height: 'toggle', opacity: 'toggle' }, {
                        duration: 300,
                        step: function (now, fx) {
                            if (scrolled) scrollToBottom(jQuery1_11_1('#shchat-msgs-' + window));
                        }
                    });
                }



            } else if (action == 'user_typing') {
                var userid = recv.data.uid;
                var main = jQuery1_11_1("#shchat-online-" + userid);

                main.attr('src', path + 'images/typing.png');

                if (timer != null) clearTimeout(timer);
                timer = setTimeout(function () {
                    if (main.attr('src') != path + 'images/offline.png') main.attr('src', path + 'images/online.png');
                }, 2000);
            } else if (action == 'disconnect') {
                if (recv.user != undefined) jQuery1_11_1('#shchat-online-' + recv.user.uid).attr('src', path + 'images/offline.png');
            } else if (action == 'usrlist') {

                online_users = {};

                for (var i in recv.user) {

                    if (i != id_g) {
                        var current = recv.user[i];
                        var uid = current.uid;
                        online_users[uid] = current;
                    }
                }

                if (!is_search) update_online_list();
            } else {
                console.log('ERROR');
            }
        }


        function handle_self(recv) {
            var action = recv.action;

            if (action == 'minmax') {
                var obj = recv.obj;
                var state = recv.state;

                min_max(obj, state, true, true);
            } else if (action == 'open_chat') {
                var uid = recv.uid;
                var name = recv.name;
                var avatar = recv.avatar;
                var profile = recv.profile;
                var online = recv.online;
                var read = recv.read;

                if (!open_chat(uid, name, avatar, profile, online, read, true)) read_history(uid);
            } else if (action == 'close_chat') {
                var window = recv.window;

                close_chat(window, true);
            } else if (action == 'read_msg') {
                var user_id = recv.user_id;

                read_msg(user_id, true);
            } else if (action == 'mute_unmute') {
                var value = recv.value;

                mute_unmute(value, true);
            } else if (action == 'connect_disconnect') {
                var value = recv.value;

                connect_disconnect(value, true);
            }
        }

        function min_max(obj) {
            var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var cool = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
            var self = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

            if (self) {
                var container = jQuery1_11_1('#' + obj);
                var minmax = jQuery1_11_1('#' + obj + "-minmax");
                if (state == 'max') {
                    if (cool) container.slideDown('fast', function () {
                        scrollToBottom(container.find('.shchat-msgs'));
                    }); else {
                        container.css('display', 'block');
                        scrollToBottom(container.find('.shchat-msgs'));
                    }
                    minmax.prop('alt', 'min');
                    minmax.prop('src', path + 'images/min.png');
                    minmax.prop('title', 'Spusti');
                    container.find('.shchat-text').focus();
                } else {
                    if (cool) container.slideUp('fast'); else container.css('display', 'none');
                    minmax.prop('alt', 'max');
                    minmax.prop('src', path + 'images/max.png');
                    minmax.prop('title', 'Podigni');
                }
            } else {
                var state = "";
                if (jQuery1_11_1('#' + obj).css('display') == 'none') {
                    state = "max";
                }
                else {
                    state = "min";
                }
                if (obj == 'shchat-users') online_min = state == 'min';
                else {
                    for (var i = 0; i < opened.length; i++) {
                        if (opened[i].id == obj.replace('shchat-field-', '')) {
                            opened[i].min = state == 'min';
                            break;
                        }
                    }
                }

                save_cookies();
                socket.emit('self', { 'action': 'minmax', 'obj': obj, 'state': state });
            }
        }

        function maximize(obj) {

            for (var i = 0; i < opened.length; i++) {
                if (opened[i].id == obj.replace('shchat-field-', '')) {
                    opened[i].min = false;
                    break;
                }
            }
            save_cookies();
            socket.emit('self', { 'action': 'minmax', 'obj': obj, 'state': 'max' });
        }

        function open_chat(uid, name, avatar, profile, online, read) {

            var self = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;

            if (self) {
                if (!jQuery1_11_1('#shchat-window-' + uid).length) {

                    var offset = list_right + list_width + space + opened.length * (window_width + space);

                    var json_for_replace = {
                        '{date}': path,
                        '{profile}': profile,
                        '{name}': name,
                        '{uid}': uid,
                        '{avatar}': avatar,
                        '{path}': path
                    };

                    opened.push({ id: uid, min: false });
                    jQuery1_11_1(replaceJSON(chat_window, json_for_replace)).appendTo('#shchat-main');
                    jQuery1_11_1('#shchat-window-' + uid).css("right", offset);
                    if (opened.length == 1) window_width = parseInt(jQuery1_11_1('#shchat-window-' + uid).css("width"));

                    if (online) jQuery1_11_1('#shchat-online-' + uid).attr('src', path + 'images/online.png');
                    else {
                        if (online_users[uid]) jQuery1_11_1('#shchat-online-' + uid).attr('src', path + 'images/online.png');
                    }

                    save_cookies();

                    if (read) {
                        jQuery1_11_1('#shchat-window-' + uid).find('.shchat-text').focus();
                    }

                    return false;

                } else {
                    if (read) {
                        read_msg(uid);
                        maximize("shchat-field-" + uid);
                    }
                    return true;
                }
            } else {
                socket.emit('self', {
                    'action': 'open_chat', 'uid': uid, 'name': name, 'avatar': avatar, 'profile': profile, 'online': online, 'read': read
                });
                return false;
            }
        }


        function close_chat(window) {
            var self = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


            if (self) {
                var obj = jQuery1_11_1('#' + window);

                obj.hide('fast', function () {
                    obj.remove();

                    var match = -1;
                    for (var i = 0; i < opened.length; i++) {
                        if (opened[i].id == window.replace('shchat-window-', '')) {
                            match = i;
                            opened.splice(i, 1);
                            i--;
                        }
                        else {
                            if (match > -1 && i >= match) {
                                var offset = list_right + list_width + space + i * (window_width + space);
                                jQuery1_11_1('#shchat-window-' + opened[i].id).css("right", offset);
                            }

                        }
                    }


                    save_cookies();

                    if (match < opened.length) {
                        jQuery1_11_1('#shchat-window-' + opened[match].id).find('.shchat-text').focus();
                    }
                    else if (match - 1 >= 0 && match - 1 < opened.length) {
                        jQuery1_11_1('#shchat-window-' + opened[match - 1].id).find('.shchat-text').focus();
                    }
                });

            } else {
                socket.emit('self', { 'action': 'close_chat', 'window': window });
            }
        }

        function read_history(uid) {
            var ignore_date = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
            var ignore_msg = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

            jQuery1_11_1.post(php_path + "php/ajax.php", { action: "history", dest_user: id_g, src_user: uid, name: name_g, email: email_g, security: security_g, ignore_date: ignore_date, ignore_msg: ignore_msg }, ajax_history, "json");
        }

        function read_msg(user_id) {
            var self = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (self) {

                jQuery1_11_1('#shchat-window-' + user_id).find('.shchat-header').removeClass('newmsg');

                unread--;
                if (unread < 0) unread = 0;
                if (unread == 0) document.title = title; else document.title = "(" + unread + ") " + title;

                var msgs = jQuery1_11_1('#shchat-window-' + user_id).find('.shchat-msgs');
                msgs.find('hr').each(function () {
                    jQuery1_11_1(this).remove();
                });

                scrollToBottom(msgs);

            } else {

                if (jQuery1_11_1('#shchat-window-' + user_id).find('.shchat-header').hasClass('newmsg')) {
                    socket.emit('self', { action: 'read_msg', 'user_id': user_id });
                    jQuery1_11_1.post(php_path + "php/ajax.php", { action: "read_msg", dest_user: id_g, src_user: user_id, name: name_g, email: email_g, security: security_g });
                }
            }
        }

        function mute_unmute(value) {
            var self = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (self) {

                var button = jQuery1_11_1('#shchat-users-mute');
                if (value == true || value == "true") {
                    sound = true;
                    button.prop('alt', 'mute');
                    button.prop('src', path + 'images/unmute.png');
                    button.prop('title', 'Ugasi zvuk');
                } else {
                    sound = false;
                    button.prop('alt', 'unmute');
                    button.prop('src', path + 'images/mute.png');
                    button.prop('title', 'Upali zvuk');
                }
                save_cookies();
            } else {
                socket.emit('self', { 'action': 'mute_unmute', 'value': value });
            }
        }

        function connect_disconnect(value) {
            var self = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (self) {

                var button = jQuery1_11_1('#shchat-users-connect');
                var online = jQuery1_11_1('#shchat-onoff');
                var cnt = jQuery1_11_1('#shchat-count');
                if (value) {
                    connection = true;
                    button.prop('alt', 'disconnect');
                    button.prop('src', path + 'images/connect.png');
                    button.prop('title', 'Ugasi čet');

                    online.text('Online: ');
                    cnt.text('0');

                    jQuery1_11_1.post(php_path + "php/ajax.php", { action: "unread", dest_user: id_g, name: name_g, email: email_g, security: security_g }, ajax_unread, "json");
                } else {
                    connection = false;
                    button.prop('alt', 'connect');
                    button.prop('src', path + 'images/disconnect.png');
                    button.prop('title', 'Upali čet');

                    online.text('Offline');
                    cnt.text('');

                    jQuery1_11_1('#shchat-main').find('.shchat-window').each(function () {
                        if (jQuery1_11_1(this).attr('id') != 'shchat-online-list') close_chat(jQuery1_11_1(this).attr('id'), true);
                    });

                    jQuery1_11_1('#shchat-list').html("");
                    jQuery1_11_1('#shchat-list').css('height', 0);
                }
                save_cookies();
            } else {
                socket.emit('online', { 'value': value });
            }
        }


        function ajax_history(data1) {

            var seen_i = -1;
            var last_seen = true;
            for (var i = data1.length - 1; i >= 0; i--) {
                var data = data1[i];

                var seen = data.seen;
                var dest_user = data.dest_user;
                var window = dest_user;
                if (window == id_g) {
                    if (!seen && last_seen) {
                        seen_i = i;
                        break;
                    }
                }
            }
            for (var i = 0; i < data1.length; i++) {
                var data = data1[i];

                var date = new Date(data.date);
                var today = new Date();

                var dest_user = data.dest_user;
                var user_id = data.user.uid;
                var user_name = data.user.name;
                var user_avatar = data.user.avatar;
                var user_profile = data.user.profile;
                var msg = replaceEmoticon(urlify(data.msg));

                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();

                var hour = date.getHours().toString();
                if (hour.length == 1) hour = '0' + hour;
                var minute = date.getMinutes().toString();
                if (minute.length == 1) minute = '0' + minute;

                var string_date = hour + ":" + minute;

                if (today.toDateString() !== date.toDateString()) string_date = day + "." + month + "." + year + ". " + string_date;

                var json_for_replace = {
                    '{date}': string_date,
                    '{msg}': msg,
                    '{name}': user_name,
                    '{uid}': user_id,
                    '{avatar}': user_avatar
                };

                var window = dest_user;
                if (window == id_g) {
                    window = user_id;
                    jQuery1_11_1('#shchat-msgs-' + window).prepend(replaceJSON(recv_msg, json_for_replace));

                    if (i == seen_i) {
                        if (!jQuery1_11_1('#shchat-window-' + window).find('.shchat-header').hasClass('newmsg')) {
                            unread++;
                            document.title = "(" + unread + ") " + title;
                            jQuery1_11_1('#shchat-window-' + window).find('.shchat-header').addClass('newmsg');
                            jQuery1_11_1('#shchat-msgs-' + window).prepend('<hr/>');
                        }
                        if (sound) {
                            audio.play();
                        }
                    }
                } else {

                    jQuery1_11_1('#shchat-msgs-' + window).prepend(replaceJSON(sent_msg, json_for_replace));
                }


            }
            scrollToBottom(jQuery1_11_1('#shchat-msgs-' + window));

        }

        function ajax_unread(data) {
            for (var i = 0; i < data.length; i++) {
                var user = data[i];

                var uid = user.uid;
                var name = user.name;
                var avatar = user.avatar;
                var profile = user.profile;

                if (!open_chat(uid, name, avatar, profile, false, false, true)) read_history(uid);
            }
        }

        function scrollToBottom(elem) {
            elem.scrollTop(function () {
                return this.scrollHeight + 50;
            });
        }


        /*function getHTMLOfSelection() {
            var range;
            if (document.selection && document.selection.createRange) {
                range = document.selection.createRange();
                return range.htmlText;
            }
            else if (window.getSelection) {
                var selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    range = selection.getRangeAt(0);
                    var clonedSelection = range.cloneContents();
                    var div = document.createElement('div');
                    div.appendChild(clonedSelection);
                    console.log(range);
                    return div.innerHTML;
                }
                else {
                    return '';
                }
            }
            else {
                return '';
            }
        }*/


        jQuery1_11_1(document).on('click', '.shchat-close', function (e) {

            stop_propag = true;
            var window = jQuery1_11_1(this).parents('.shchat-window').attr('id');
            close_chat(window);
        });

        jQuery1_11_1(document).on('click', '#shchat-users-mute', function (e) {

            stop_propag = true;
            mute_unmute(!sound);
        });

        jQuery1_11_1(document).on('click', '#shchat-users-connect', function (e) {

            stop_propag = true;
            connect_disconnect(!connection);
        });

        jQuery1_11_1(document).on('click', '.shchat-header', function (e) {

            if (!stop_propag) {
                var window = jQuery1_11_1(this).parents('.shchat-window').attr('id');
                if (window != 'shchat-online-list') {
                    var obj = jQuery1_11_1('#' + window).find('.shchat-field').attr('id');
                    min_max(obj);
                } else {
                    min_max('shchat-users');
                }
            }
            stop_propag = false;
        });

        jQuery1_11_1(document).on('click', '.shchat-user', function (e) {
            var uid1 = jQuery1_11_1(this).data('uid');
            var name1 = jQuery1_11_1(this).data('name');
            var avatar1 = jQuery1_11_1(this).data('avatar');
            var profile1 = jQuery1_11_1(this).data('profile');

            var online = false;
            if (online_users[uid1]) online = true;
            if (is_search) {
                jQuery1_11_1('#shchat-search').val('');
                is_search = false;
                update_online_list();
            }
            if (!open_chat(uid1, name1, avatar1, profile1, online, true)) read_history(uid1);
        });

        jQuery1_11_1(document).on('keyup', '.shchat-text', function (e) {
            var uid = jQuery1_11_1(this).attr('id').replace('shchat-text-', '');
            var keyCode = e.keyCode || e.which;

            if (keyCode == 13 && !e.shiftKey) {

                var msg = jQuery1_11_1(this).val().trim().substr(0, 10000);
                if (msg != "") {
                    var date = Math.floor(((new Date()).getTime() + diff) / 1000);

                    socket.emit('message', { 'user_id': uid, 'msg': msg, 'date': date });
                    jQuery1_11_1.post(php_path + "php/ajax.php", { action: "new_msg", dest_user: id_g, src_user: uid, msg: msg, name: name_g, date: date, email: email_g, security: security_g });
                }
                jQuery1_11_1(this).val(save_enter);
                holding_enter = false;
                return false;
            }
            else if (keyCode == 27 && !holding_enter) {

                var window = jQuery1_11_1(this).parents('.shchat-window').attr('id');
                close_chat(window);
            }
            else if (keyCode == 9 && !holding_enter) {

                var match = -1;
                for (var i = 0; i < opened.length; i++) {
                    if (opened[i].id == jQuery1_11_1(this).parents('.shchat-window').attr('id').replace('shchat-window-', '')) {
                        match = i;
                        break;
                    }
                }
                match--;
                if (match < 0) match += opened.length;
                jQuery1_11_1('#shchat-window-' + opened[match].id).find('.shchat-text').focus();
                return false;
            }
        });

        jQuery1_11_1(document).on('keydown', '.shchat-text', function (e) {
            var uid = jQuery1_11_1(this).attr('id').replace('shchat-text-', '');
            var keyCode = e.keyCode || e.which;
            read_msg(uid);

            if (keyCode != 27 && keyCode != 9 && (keyCode != 13 || e.shiftKey)) {

                socket.emit('user_typing', { 'user_id': uid });
            }
            else {
                if (keyCode == 13 && !e.shiftKey) {
                    holding_enter = true;
                    save_enter = "";
                }
                return false;
            }
        });

        jQuery1_11_1(document).on('keypress', '.shchat-text', function (e) {
            if (e.which !== 0 &&
                !e.ctrlKey && !e.metaKey && !e.altKey && holding_enter) {
                save_enter += String.fromCharCode(e.which);
                return false;
            }
        });

        jQuery1_11_1(document).on('focusout', '.shchat-text', function (e) {
            holding_enter = false;
            save_enter = "";
        });

        jQuery1_11_1(document).on('keyup', '#shchat-search', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode == 27 || jQuery1_11_1(this).val().length == 0) {
                jQuery1_11_1(this).val('');
                is_search = false;
                update_online_list();
            }
            else {
                is_search = true;
                jQuery1_11_1('#shchat-onoff').text('Search: ');
                jQuery1_11_1('#shchat-count').text('0');

                jQuery1_11_1.post(php_path + "php/ajax.php", { action: "search", 'search': jQuery1_11_1(this).val(), name: name_g, email: email_g, security: security_g }, ajax_search, 'json');
            }
        });

        jQuery1_11_1(document).on('mousedown', '.shchat-window', function () {
            var id = jQuery1_11_1(this).attr('id').replace('shchat-window-', '');
            read_msg(id);
        });



        function update_online_list() {
            jQuery1_11_1('#shchat-list').html("");
            var n = 0;
            for (var uid in online_users) {
                n++;
                var current = online_users[uid];

                var json_for_replace = {
                    '{profile}': current.profile,
                    '{name}': current.name,
                    '{uid}': uid,
                    '{avatar}': current.avatar,
                    '{color}': current.color
                };
                jQuery1_11_1('#shchat-list').append(replaceJSON(online_user, json_for_replace));
                if (jQuery1_11_1('#shchat-online-' + uid).attr('src') != path + 'images/typing.png') jQuery1_11_1('#shchat-online-' + uid).attr('src', path + 'images/online.png');
            }
            jQuery1_11_1('#shchat-onoff').text('Online: ');
            jQuery1_11_1('#shchat-count').text(n);
            jQuery1_11_1('#shchat-list').css('height', 27 * n);
        }

        function ajax_search(data) {
            //console.log(data);
            jQuery1_11_1('#shchat-list').html("");
            var n = 0;
            for (var i = 0; i < data.length; i++) {
                var current = data[i];

                if (current.id != id_g) {
                    n++;
                    var json_for_replace = {
                        '{profile}': current.profile,
                        '{name}': current.username,
                        '{uid}': current.id,
                        '{avatar}': current.avatar,
                        '{color}': current.color
                    };
                    jQuery1_11_1('#shchat-list').append(replaceJSON(online_user, json_for_replace));
                }

            }
            jQuery1_11_1('#shchat-count').text(n);
            jQuery1_11_1('#shchat-list').css('height', 27 * n);
        }

        /*jQuery1_11_1(document).on('mouseup', '.shchat-window', function () {
            jQuery1_11_1(this).find('.shchat-text').focus();
            //return false;
        });*/


        /*jQuery1_11_1(document).bind('copy', function () {
            var html = getHTMLOfSelection();
        });*/


    }

};