import React, { Component } from "react";
import DiscoverBlock from "./DiscoverBlock/components/DiscoverBlock";
import "../styles/_discover.scss";
import qs from "querystring";
import Ouroboro from "@bit/joshk.react-spinners-css.ouroboro";

const config = require("../../../config");
const axios = require("axios");

export default class Discover extends Component {
  constructor() {
    super();

    this.state = {
      newReleases: [],
      playlists: [],
      categories: [],
      isLoading: true,
    };
  }
  componentDidMount = async () => {
    const newReleases = await this.makeRequest("new-releases", "albums");
    const playlists = await this.makeRequest("featured-playlists", "playlists");
    const categories = await this.makeRequest("categories", "categories");
    this.setState({
      newReleases,
      playlists,
      categories,
      isLoading: false,
    });
  };

  makeRequest = async (path, resourceType) => {
    const {
      data: { access_token: token },
    } = await axios.post(
      "https://accounts.spotify.com/api/token",
      qs.stringify({ grant_type: "client_credentials" }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(
            `${config.default.api.clientId}:${config.default.api.clientSecret}`
          )}`,
        },
      }
    );

    const res = await axios.get(
      `${config.default.api.baseUrl}/browse/${path}?locale=en_US`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return res.data[resourceType].items;
  };
  render() {
    const { newReleases, playlists, categories } = this.state;

    return (
      <div className="discover">
        {this.state.isLoading ? (
          <div
            style={{
              height: "250px",
              display: "flex",
            }}
          >
            <Ouroboro style={{ margin: "auto" }} color="#be97e8" />
          </div>
        ) : (
          <>
            <DiscoverBlock
              text="RELEASED THIS WEEK"
              id="released"
              data={newReleases}
            />
            <DiscoverBlock
              text="FEATURED PLAYLISTS"
              id="featured"
              data={playlists}
            />
            <DiscoverBlock
              text="BROWSE"
              id="browse"
              data={categories}
              imagesKey="icons"
            />
          </>
        )}
      </div>
    );
  }
}
