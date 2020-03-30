const sdk = require("symbl-node").sdk;
const SpeakerEvent = require("symbl-node").SpeakerEvent;

sdk
  .init({
    appId: "<your_app_id>",
    appSecret: "<your_app_secret>",
    basePath: "https://api.symbl.ai"
  })
  .then(() => {
    console.log("SDK Initialized");

    sdk
      .startEndpoint({
        endpoint: {
          type: "pstn",
          phoneNumber: "<your_phone_number>",
          dtmf: "<code>" // you can find this on the meeting plaform invite. Leave blank if not connecting to a meeting platform
        },
        actions: [
          {
            invokeOn: "stop",
            name: "sendSummaryEmail",
            parameters: {
              emails: ["your_email@example.com"]
            }
          }
        ]
      })
      .then(connection => {
        const connectionId = connection.connectionId;
        console.log("Successfully connected.", connectionId);

        const speakerEvent = new SpeakerEvent({
          type: SpeakerEvent.types.startedSpeaking,
          user: {
            userId: "john@example.com",
            name: "John"
          }
        });

        setTimeout(() => {
          speakerEvent.timestamp = new Date().toISOString();
          sdk.pushEventOnConnection(
            connectionId,
            speakerEvent.toJSON(),
            err => {
              if (err) {
                console.error("Error during push event.", err);
              } else {
                console.log("Event pushed!");
              }
            }
          );
        }, 1000);

        setTimeout(() => {
          speakerEvent.type = SpeakerEvent.types.stoppedSpeaking;
          speakerEvent.timestamp = new Date().toISOString();

          sdk.pushEventOnConnection(
            connectionId,
            speakerEvent.toJSON(),
            err => {
              if (err) {
                console.error("Error during push event.", err);
              } else {
                console.log("Event pushed!");
              }
            }
          );
        }, 12000);

        // Scheduling stop endpoint call after 60 seconds
        setTimeout(() => {
          sdk
            .stopEndpoint({
              connectionId: connection.connectionId
            })
            .then(() => {
              console.log("Stopped the connection");
              console.log("Summary Info:", connection.summaryInfo);
              console.log("Conversation ID:", connection.conversationId);
            })
            .catch(err =>
              console.error("Error while stopping the connection.", err)
            );
        }, 10000);
      })
      .catch(err => console.error("Error while starting the connection", err));
  })
  .catch(err => console.error("Error in SDK initialization.", err));
