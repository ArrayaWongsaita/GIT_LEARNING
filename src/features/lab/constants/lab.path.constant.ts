class LabPath {
  base = "/lab";
  basicFlow = "basic-flow";
  featureToDevFlow = "feature-to-dev-flow";
  localSquashFlow = "local-squash-flow";
  bookingFlow = "booking-flow";

  getBasicFlowPath() {
    return `${this.base}/${this.basicFlow}`;
  }

  getFeatureToDevFlowPath() {
    return `${this.base}/${this.featureToDevFlow}`;
  }

  getLocalSquashFlowPath() {
    return `${this.base}/${this.localSquashFlow}`;
  }

  getBookingFlowPath() {
    return `${this.base}/${this.bookingFlow}`;
  }
}

export const labPath = new LabPath();
