
function textForMemberEvent(ev) {
    // XXX: SYJS-16
    var senderName = ev.sender ? ev.sender.name : ev.getSender();
    var targetName = ev.target ? ev.target.name : ev.getStateKey();
    var reason = ev.getContent().reason ? (
        " Reason: " + ev.getContent().reason
    ) : "";
    switch (ev.getContent().membership) {
        case 'invite':
            return senderName + " invited " + targetName + ".";
        case 'ban':
            return senderName + " banned " + targetName + "." + reason;
        case 'join':
            if (ev.getPrevContent() && ev.getPrevContent().membership == 'join') {
                if (ev.getPrevContent().displayname && ev.getContent().displayname && ev.getPrevContent().displayname != ev.getContent().displayname) {
                    return ev.getSender() + " changed their display name from " +
                        ev.getPrevContent().displayname + " to " +
                        ev.getContent().displayname;
                } else if (!ev.getPrevContent().displayname && ev.getContent().displayname) {
                    return ev.getSender() + " set their display name to " + ev.getContent().displayname;
                } else if (ev.getPrevContent().displayname && !ev.getContent().displayname) {
                    return ev.getSender() + " removed their display name";
                } else if (ev.getPrevContent().avatar_url && !ev.getContent().avatar_url) {
                    return ev.getSender() + " removed their profile picture";
                } else if (ev.getPrevContent().avatar_url && ev.getContent().avatar_url && ev.getPrevContent().avatar_url != ev.getContent().avatar_url) {
                    return ev.getSender() + " changed their profile picture";
                } else if (!ev.getPrevContent().avatar_url && ev.getContent().avatar_url) {
                    return ev.getSender() + " set a profile picture";
                }
            } else {
                if (!ev.target) console.warn("Join message has no target! -- " + ev.getContent().state_key);
                return targetName + " joined the room.";
            }
            return '';
        case 'leave':
            if (ev.getSender() === ev.getStateKey()) {
                return targetName + " left the room.";
            }
            else if (ev.getPrevContent().membership === "ban") {
                return senderName + " unbanned " + targetName + ".";
            }
            else if (ev.getPrevContent().membership === "join") {
                return senderName + " kicked " + targetName + "." + reason;
            }
            else if (ev.getPrevContent().membership === "invite") {
                return senderName + " withdrew " + targetName + "'s invitation." + reason;
            }
            else {
                return targetName + " left the room.";
            }
    }
};

function textForTopicEvent(ev) {
    var senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();

    return senderDisplayName + ' changed the topic to, "' + ev.getContent().topic + '"';
};

function textForMessageEvent(ev) {
    var senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();

    var message = senderDisplayName + ': ' + ev.getContent().body;
    if (ev.getContent().msgtype === "m.emote") {
        message = "* " + senderDisplayName + " " + message;
    } else if (ev.getContent().msgtype === "m.image") {
        message = senderDisplayName + " sent an image.";
    }
    return message;
};

function textForCallAnswerEvent(event) {
    var senderName = event.sender ? event.sender.name : "Someone";
    return senderName + " answered the call.";
};

function textForCallHangupEvent(event) {
    var senderName = event.sender ? event.sender.name : "Someone";
    return senderName + " ended the call.";
};

function textForCallInviteEvent(event) {
    var senderName = event.sender ? event.sender.name : "Someone";
    // FIXME: Find a better way to determine this from the event?
    var type = "voice";
    if (event.getContent().offer && event.getContent().offer.sdp &&
            event.getContent().offer.sdp.indexOf('m=video') !== -1) {
        type = "video";
    }
    return senderName + " placed a " + type + " call.";
};

var handlers = {
    'm.room.message': textForMessageEvent,
    'm.room.topic': textForTopicEvent,
    'm.room.member': textForMemberEvent,
    'm.call.invite': textForCallInviteEvent,
    'm.call.answer': textForCallAnswerEvent,
    'm.call.hangup': textForCallHangupEvent,
};

module.exports = {
    textForEvent: function(ev) {
        var hdlr = handlers[ev.getType()];
        if (!hdlr) return "";
        return hdlr(ev);
    }
}
