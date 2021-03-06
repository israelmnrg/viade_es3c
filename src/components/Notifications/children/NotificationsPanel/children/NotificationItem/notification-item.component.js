import React, { useCallback } from "react";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Item, Body, Message, Meta, MarkAsRead, Delete, Img } from "./notification-item.style";
import { getUserName, getPathShareRoutes } from "../../../../../../containers/MyFriends/MyFriends";
import { createDocumentWithTurtle } from "../../../../../../utils/ldflex-helper";
import auth from "solid-auth-client";

const FC = require("solid-file-client");
const fc = new FC(auth);
type Props = {
	notification: Object,
	markAsRead: Function,
	children: React.ReactNode,
	deleteNotification: (fileName: string) => void
};

/**
 * Notification item to be shown for each notification in the notification list
 */
const NotificationItem = ({ notification, markAsRead, children, deleteNotification }: Props) => {
	const { read } = notification;
	const currentRead = read ? JSON.parse(read) : false;
	const { actor } = notification;
	/**
   * Redirect notification if it's coming with target
   * @type {Function}
   */
	const redirectTo = useCallback(
		async () => {
			if (notification.target) {
				await markAsRead(notification.path, notification.id);
				var name = notification.object.split("/");
				name = name[name.length - 1];
				const sharedFilePath = getPathShareRoutes(notification.target) + name;
				var content = await fc.readFile(notification.object);
				await createDocumentWithTurtle(sharedFilePath, content);
				window.location = "#/mySharedRoutes";
			}
		},
		[ notification ]
	);
	/**
   * @TODO: send boolean to pod like boolean and not string
   */

	const opCurrentRead = !currentRead;
	const defaultImage = "img/icon/empty.svg";
	const actorImage =
		notification && notification.actor && notification.actor.image ? notification.actor.image : defaultImage;
	return (
		<Item read={currentRead}>
			<a href={notification.actor && notification.actor.webId}>
				<Img
					src={actorImage}
					alt="Creator"
					onError={(e) => {
						e.target.onerror = null;
						e.target.src = defaultImage;
					}}
				/>
			</a>
			<Body>
				<Message onClick={redirectTo}>
					<strong>{actor && getUserName(actor.name)}</strong>
					<br />
					{notification.summary}
				</Message>
				<Meta>
					<span className="moment">{moment(notification.published).fromNow()}</span>
					{children}
				</Meta>
			</Body>
			<MarkAsRead
				type="button"
				className="delete"
				onClick={() => markAsRead(notification.path, notification.id, opCurrentRead ? "true" : "false")}
			>
				<FontAwesomeIcon icon={currentRead ? "eye-slash" : "eye"} />
			</MarkAsRead>
			<Delete id="delete" type="button" className="delete" onClick={() => deleteNotification(notification.path)}>
				<FontAwesomeIcon icon="times-circle" />
			</Delete>
		</Item>
	);
};

export default NotificationItem;
