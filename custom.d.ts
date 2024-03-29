declare module 'react-qr-scanner' {
  interface Props {
    ref?: React.Ref<{ openImageDialog: () => void }>,

    /**
     * Function to call when an error occurs such as:
     *
     * - Not supported platform
     * - The lack of available devices
     */
    onError: (error: any) => any,

    /**
     * Scan event handler. Called every scan with the decoded value or null if no QR code was found.
     */
    onScan: (result: { text: string } | null) => any,

    /**
     * Called when the component is ready for use.
     */
    onLoad?: () => any,

    /**
     * Called when the image in legacyMode is loaded.
     */
    onImageLoad?: () => any,

    /**
     * The delay between scans in milliseconds. To disable the interval pass in false.
     *
     * default: `500`
     */
    delay?: number | true,

    /**
     *  Specify which camera direction should be used (if available). Options: `front` and `rear`.
     */
    facingMode?: "rear" | "front" | "user" | "environment",

    /**
     * If the device does not allow camera access (e.g. IOS Browsers, Safari) you can enable legacyMode to allow the user to take a picture (On a mobile device) or use an existing one. To trigger the image dialog just call the method openImageDialog from the parent component. Warning You must call the method from a user action (eg. click event on some element).
     *
     * default: `false`
     */
    legacyMode?: boolean,

    /**
     * If legacyMode is active then the image will be downscaled to the given value while keepings its aspect ratio. Allowing larger images will increase the accuracy but it will also slow down the processing time.
     *
     * default: `1500`
     */
    maxImageSize?: number,

    /**
     * Styling for the preview element. This will be a video or an img when legacymode is true. Warning The preview will keep its aspect ratio, to disable this set the CSS property `objectFit` to `fill`.
     */
    style?: React.CSSProperties,

    /**
     * ClassName for the container element.
     */
    className?: string,

    /**
     * Called when choosing which device to use for scanning. By default chooses the first video device matching facingMode, if no devices match the first video device found is choosen.
     */
    chooseDeviceId?: (
      filteredDevices: MediaDeviceInfo[],
      videoDevices?: MediaDeviceInfo[]
    ) => MediaDeviceInfo[],

    /**
     * Existing MediaStream to use initially.
     */
    initialStream?: MediaStream,

    constraints?: MediaStreamConstraints,
  }

  function QrReader(props: Props): JSX.Element

  export default QrReader
}

declare module 'dirty-json' {
  export function parse(json: string): any
}