from azure.cognitiveservices.vision.customvision.prediction import CustomVisionPredictionClient
from msrest.authentication import ApiKeyCredentials
from matplotlib import pyplot as plt
from PIL import Image, ImageDraw, ImageFont
import os
from dotenv import load_dotenv

def main():
    load_dotenv()

    try:
        # Get Configuration Settings
        prediction_endpoint = os.getenv('PredictionEndpoint')
        prediction_key = os.getenv('PredictionKey')
        project_id = os.getenv('ProjectID')
        model_name = os.getenv('ModelName')

        # Ensure all environment variables are loaded
        if not all([prediction_endpoint, prediction_key, project_id, model_name]):
            raise ValueError("One or more environment variables are missing.")

        # Authenticate a client for the prediction API
        credentials = ApiKeyCredentials(in_headers={"Prediction-Key": prediction_key})
        prediction_client = CustomVisionPredictionClient(endpoint=prediction_endpoint, credentials=credentials)

        # Load image and get width and height
        image_file = 'map.png'
        print('Detecting objects in', image_file)
        image = Image.open(image_file)
        w, h = image.size

        # Detect objects in the test image
        with open(image_file, mode="rb") as image_data:
            results = prediction_client.detect_image(project_id, model_name, image_data)

            # Create a figure for the results
            fig = plt.figure(figsize=(8, 8))
            plt.axis('off')

            # Display the image with boxes around each detected object
            draw = ImageDraw.Draw(image)
            lineWidth = max(1, int(w / 150))  # Ensure minimum line width
            color = 'yellow'
            font = ImageFont.load_default()

            for prediction in results.predictions:
                # Only show objects with a > 50% probability and tag name 'Vegetação'
                if (prediction.probability * 100) > 20 and prediction.tag_name == 'Vegetação':
                    # Box coordinates and dimensions are proportional - convert to absolute values
                    left = prediction.bounding_box.left * w
                    top = prediction.bounding_box.top * h
                    height = prediction.bounding_box.height * h
                    width = prediction.bounding_box.width * w

                    # Draw the box
                    points = [(left, top), (left + width, top), (left + width, top + height), (left, top + height), (left, top)]
                    draw.line(points, fill=color, width=lineWidth)

                    # Add the tag name and probability
                    text = f"{prediction.tag_name}: {prediction.probability * 100:.2f}%"
                    text_bbox = draw.textbbox((left, top), text, font=font)
                    text_width = text_bbox[2] - text_bbox[0]
                    text_height = text_bbox[3] - text_bbox[1]
                    text_location = (left, top - text_height)
                    draw.text(text_location, text, fill=color, font=font)

            plt.imshow(image)
            outputfile = 'output.jpg'
            fig.savefig(outputfile)
            print('Result saved in', outputfile)
    except Exception as ex:
        print(f"An error occurred: {ex}")

if __name__ == "__main__":
    main()
