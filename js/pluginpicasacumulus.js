jQuery(document).ready(function($) {
	
	var albums = null;
	
	show_list();
	
	$('#pluginpicasacumulus-auth').click(function(e) {
		$('#pluginpicasacumulus-dialog-login-error').hide();
		show_dialog_login();
	});
	$('#pluginpicasacumulus-refresh').click(function(e) {
		show_list();
	});
	$(':checkbox').click(function(e) {	
		var id = e.target.id;
		var elname = 'pluginpicasacumulus-cb';
		
		if (id.substring(0, elname.length) == elname) {
			$(':checkbox').attr('checked', $(this).is(':checked'));		
		}
	});
	$('#pluginpicasacumulus-configure').click(function(e) {
		var count = 0;
		var id = '';
		$('input:checkbox:checked').each(function(i) {
			if ($(this).attr('id') != 'pluginpicasacumulus-cb1' 
			&& $(this).attr('id') != 'pluginpicasacumulus-cb2') {
				id = $(this).val();
				count++;
			}
		});
		if (count < 1) {
			show_dialog_error(message_select_least);
		} else if (count > 1) {
			show_dialog_error(message_select_single);
		} else {
			var album = null;
			$.each(albums, function(i) {
				if (albums[i].id_album == id) {
					album = albums[i];
				}
			});
			$('#pluginpicasacumulus-configure-album').text(album.title);
			$('#pluginpicasacumulus-configure-width').val(album.width);
			$('#pluginpicasacumulus-configure-height').val(album.height);
			$('#pluginpicasacumulus-configure-bgcolor').val(album.bgcolor);
			$('#pluginpicasacumulus-dialog-configure-error').hide();
			show_dialog_configure();
		}
	});
	$('#pluginpicasacumulus-list tr').mouseenter(function(e) {
		$('pluginpicasacumulus-thumbnail').hide();
		var id = $(this).attr('id').substring(6, $(this).attr('id').length);
		var album = null;
		$.each(albums, function(i) {
			album = albums[i];
			if (album.id_album == id) {
				$('#pluginpicasacumulus-thumbnail-img').attr('src', album.thumbnail.url);
				$('#pluginpicasacumulus-thumbnail-img').width(album.thumbnail.width);
				$('#pluginpicasacumulus-thumbnail-img').height(album.thumbnail.height);
				$('#pluginpicasacumulus-thumbnail').css({
																		left: e.pageX,
																		top: e.pageY
																		});
				$('#pluginpicasacumulus-thumbnail-info').text(album.numphotos + ' photo(s)');
				$('#pluginpicasacumulus-thumbnail').show();
				$('#pluginpicasacumulus-thumbnail').css({
																opacity: 0.75
																});
			}
		});
	});
	$('#pluginpicasacumulus-list tr').mousemove(function(e) {
		var id = $(this).attr('id').substring(6, $(this).attr('id').length);
		var album = null;
		$.each(albums, function(i) {
			album = albums[i];
			if (album.id_album == id) {
				$('#pluginpicasacumulus-thumbnail-img').attr('src', album.thumbnail.url);
				$('#pluginpicasacumulus-thumbnail-img').width(album.thumbnail.width);
				$('#pluginpicasacumulus-thumbnail-img').height(album.thumbnail.height);
				
				$('#pluginpicasacumulus-thumbnail').css({
																		left: e.pageX + 4 + 'px',
																		top: e.pageY + 4 + 'px'
																		});
				$('#pluginpicasacumulus-thumbnail-info').text(album.numphotos + ' photo(s)');
				
			}
		});
	});
	$('#pluginpicasacumulus-list tr').mouseout(function(e) {
		$('#pluginpicasacumulus-thumbnail').fadeOut();
	});
	
	$('#pluginpicasacumulus-dialog-error').dialog({
		closeOnEscape: false,
		position: ['center', 'middle'],
		modal: true,
		draggable: false,
		resizable: false, 
		closeText: 'X',
		autoOpen: false,
		buttons: {
			'ok': function() {
				$(this).dialog('close');
			}
		}
	});
	
	$('#pluginpicasacumulus-dialog-notification').dialog({
		closeOnEscape: false,
		position: ['center', 'middle'],
		modal: true,
		draggable: false,
		resizable: false, 
		closeText: 'X',
		autoOpen: false,
		buttons: {
			'ok': function() {
				$(this).dialog('close');
			}
		}
	});
	$('#pluginpicasacumulus-dialog-login').dialog({
		position: ['center', 'middle'],
		modal: true,
		draggable: false,
		resizable: false, 
		closeText: 'X',
		autoOpen: false,
		width: 350,
		height: 300,
		buttons: {
			'ok': function() {
				result = auth();
				if (result[0] == true) {
					$(this).dialog('close');
					return;
				} else {
					$('#pluginpicasacumulus-dialog-login-error-message').text(result[1].responseText);
					$('#pluginpicasacumulus-dialog-login-error').show();
				}
			},
			'cancel': function() {
				$(this).dialog('close');
			}
		}
	});
	$('#pluginpicasacumulus-dialog-configure').dialog({
		position: ['center', 'middle'],
		modal: true,
		draggable: false,
		resizable: false, 
		closeText: 'X',
		autoOpen: false,
		width: 350,
		height: 350,
		buttons: {
			'ok': function() {
				var configuration = ({
					id_album: $('input:checkbox:checked').val(), 
					width: $('#pluginpicasacumulus-configure-width').val(),
					height: $('#pluginpicasacumulus-configure-height').val(),
					bgcolor: $('#pluginpicasacumulus-configure-bgcolor').val()
				});
				var result = configure(configuration);
				if (result[0] == false) {
					$('#pluginpicasacumulus-dialog-configure-error-message').text(result[1].responseText);
					$('#pluginpicasacumulus-dialog-configure-error').show();
				} else {
					$(this).dialog('close');
					show_list();
					show_dialog_notification(result[1]);
				}
			},
			'cancel': function() {
				$(this).dialog('close');
			}
		}
	});
	
	function show_list() {
		$('#pluginpicasacumulus-list > *').remove();
		list();
		if (albums == null) {
			$('#pluginpicasacumulus-list').append('<tr><td colspan="5">' + message_no_album + '</td></tr>');
		} else {
			var album = null;
			$.each(albums, function(i) {
				album = albums[i];
				$('#pluginpicasacumulus-list').append('<tr id="album-' + album.id_album + '"></tr>');
				$('#album-' + album.id_album).append('<th class="check-column" scope="row"><input id="checkbox-' + album.id_album + '" class="administrator" type="checkbox" value="' + album.id_album + '" name="albums[]"/></th>');
				$('#album-' + album.id_album).append('<td class="title column-title">' + album.title + '</td>');
				$('#album-' + album.id_album).append('<td class="numphotos column-numphotos">' + album.numphotos + '</td>');
				$('#album-' + album.id_album).append('<td class="updated column-updated">' + album.updated + '</td>');
				$('#album-' + album.id_album).append('<td class="author column-author">' + album.author + '</td>');
				var label_access = album.access;
				if (album.access == 'private') {
					label_access = label_private;
				} else if (album.access == 'protected') {
					label_access = label_protected;
				} else if (album.access == 'public') {
					label_access = label_public;
				}
				$('#album-' + album.id_album).append('<td class="access column-access">' + label_access + '</td>');
				$('#album-' + album.id_album).append('<td class="shortcode column-shortcode">[pluginpicasacumulus id="' + album.id_album + '"]</td>');
			});
		}
		
	}
	function show_dialog_configure() {
		$('#pluginpicasacumulus-dialog-configure').parent().children().eq(2).children().eq(0).text(label_ok);
		$('#pluginpicasacumulus-dialog-configure').parent().children().eq(2).children().eq(1).text(label_cancel);
		$('#pluginpicasacumulus-dialog-configure').dialog('open');
	}
	function show_dialog_error(message) {
		$('#pluginpicasacumulus-error-message').text(message);
		$('#pluginpicasacumulus-dialog-error').parent().children().eq(2).children().eq(0).text(label_ok);
		$('#pluginpicasacumulus-dialog-error').dialog('open');
	}
	function show_dialog_notification(message) {
		$('#pluginpicasacumulus-notification-message').text(message);
		$('#pluginpicasacumulus-dialog-notification').parent().children().eq(2).children().eq(0).text(label_ok);
		$('#pluginpicasacumulus-dialog-notification').dialog('open');
	}
	function show_dialog_login() {
		$('#pluginpicasacumulus-dialog-login').parent().children().eq(2).children().eq(0).text(label_ok);
		$('#pluginpicasacumulus-dialog-login').parent().children().eq(2).children().eq(1).text(label_cancel);
		$('#pluginpicasacumulus-dialog-login').dialog('open');
	}
	function configure(configuration) {
		var params = ({
			action: 'picasacumulus_configure',
			id_album: configuration.id_album,
			width: configuration.width,
			height: configuration.height,
			bgcolor: configuration.bgcolor,
			cookie: encodeURIComponent(document.cookie)			
		});
		var result = exec_ajax(params);
		return result;
	}
	function auth() {
		var params = ({
			action: 'picasacumulus_authenticate',
			email: $('#pluginpicasacumulus-email').val(),
			password: $('#pluginpicasacumulus-password').val(),
			cookie: encodeURIComponent(document.cookie)
		});
		var result = exec_ajax(params);
		return result;
	}
	function save() {
		var params = ({
			action: 'picasacumulus_save',
			cookie: encodeURIComponent(document.cookie)
		});
		var result = exec_ajax(params);
		return result;
	}
	function list() {
		$('#pluginpicasacumulus-dialog-login-error').hide();
		$('#pluginpicasacumulus-list > *').remove();
		var params = ({
			action: 'picasacumulus_list',
			cookie: encodeURIComponent(document.cookie)
		});
		var result = exec_ajax(params);
		if (result[0] == true) {
			albums = $.evalJSON(result[1]);
		} else {
			albums = null;
			if (result[1].responseText == 'AuthenticationRequired') {
				show_dialog_error(message_authentication_required);
			}
		}
	}
	function exec_ajax(params) {
		var result = [];
		$.ajax({
			async: false,
			type: 'POST',
			url: ajaxurl, 
			data: params,
			success: function(data) {
				result[0] = true;
				result[1] = data;
			},
			error: function(data) {
				result[0] = false;
				result[1] = data;
			}
		});
		return result;
	}
});