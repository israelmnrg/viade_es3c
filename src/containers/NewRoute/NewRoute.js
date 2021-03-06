import React from "react";
import Map from "./Map";
import { errorToaster, successToaster } from "@utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Header, RouteWrapper, TextArea, DivForms, LabelInput, TitleRoute, Button, RouteForm } from "./route.style";
import { Route, Point, Multimedia } from "../../domain";
import { MultimediaComponent } from "../UploadMultimedia/multimedia.container";
import i18n from "i18n";
import * as viadeManager from "../../utils/viadeManagerSolid";

type Props = {
	webId: String
};

class NewRoute extends React.Component {
	constructor({ webId }: Props) {
		super();
		this.webID = webId;
		this.handleSave = this.handleSave.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.title = React.createRef();
		this.description = React.createRef();
		this.state = {
			markers: null
		};
	}

	state = { markers: {}, image: {} };

	callBackFunction = (childData) => {
		this.setState({ markers: childData });
	};

	componentWillUnmount() {}

	handleChange(event) {
		this.setState({ value: event.target.value });
	}

	handleSubmit(event) {
		event.preventDefault();
		this.handleSave(event);
	}

	async handleSave(event) {
		if (this.title.current.value.length === 0) {
			errorToaster(i18n.t("newRoute.errorTitle"), "ERROR");
		} else if (this.description.current.value.length === 0) {
			errorToaster(i18n.t("newRoute.errorDescription"), "ERROR");
		} else if (this.state.markers === null || this.state.markers.length < 0) {
			errorToaster(i18n.t("newRoute.errorPoints"), "ERROR");
		} else if (this.state.markers.length === 1) {
			errorToaster(i18n.t("newRoute.errorOnePoint"), "ERROR");
		} else {
			const points = [];
			for (let i = 0; i < this.state.markers.length; i++) {
				points.push(
					new Point(
						this.state.markers[parseInt(i)].position.lat,
						this.state.markers[parseInt(i)].position.lng,
						this.state.markers[parseInt(i)].position.alt
					)
				);
			}

			let author = this.webID.replace("https://", "");
			author = author.replace(".solid.community/profile/card#me", "");
			author = author.replace(".inrupt.net/profile/card#me", "");

			const multimedia = [];
			let filesFolder = document.getElementsByClassName("file-uploader--input");
			let filesMult = filesFolder[0].files;
			let url = this.webID.replace("profile/card#me", "private/viade/rawMedia/");
			for (let j = 0; j < filesMult.length; j++) {
				let name = filesMult[parseInt(j)].name.split(".")[0];
				name = name.replace(/ /g, "");
				var d = Date(Date.now());
				multimedia.push(
					new Multimedia(
						url + filesMult[parseInt(j)].name.replace(/ /g, ""),
						d.toString(),
						author,
						name,
						null
					)
				);
			}
			let route = new Route(this.title.current.value, author, this.description.current.value, points, multimedia);
			await viadeManager.addRoute(route, this.webID);
			successToaster(i18n.t("newRoute.successRoute"), i18n.t("newRoute.success"));
			setTimeout(function() {
				window.location.href = "#/myRoutes";
			}, 1000);
		}
		event.persist();
	}

	render(): React.ReactNode {
		return (
			<RouteWrapper data-testid="route-component">
				<Header data-testid="route-header">
					<TitleRoute>{i18n.t("newRoute.title")}</TitleRoute>
					<RouteForm id="routef">
						<DivForms>
							<LabelInput>
								{i18n.t("newRoute.name")}{" "}
								<input type="text" id="route_name" name="route_name" ref={this.title} />
							</LabelInput>
						</DivForms>
						<DivForms>
							<LabelInput>
								{" "}
								{i18n.t("newRoute.description")}{" "}
								<TextArea
									type="text"
									id="description"
									name="description"
									rows="10"
									ref={this.description}
								/>{" "}
							</LabelInput>
						</DivForms>
					</RouteForm>
					<DivForms>
						<MultimediaComponent id="input-img" webId={`[${this.webId}]`} image="" />
						<hr />
						<Button id="save_route" form="routef" type="submit" onClick={(e) => this.handleSubmit(e)}>
							<FontAwesomeIcon icon="save" className="save-icon" title={i18n.t("newRoute.btnSave")} />
							{"	" + i18n.t("newRoute.btnSave")}
						</Button>
					</DivForms>
				</Header>

				<Map parentCallBack={this.callBackFunction} zoom={13} />
			</RouteWrapper>
		);
	}
}

export default NewRoute;
