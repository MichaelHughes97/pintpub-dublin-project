const db = require("../config/db");

// Convert each atmosphere option into a number
const atmosphereValues = {
  Quiet: 1,
  Moderate: 2,
  Busy: 3,
  "Very Busy": 4,
};

// Convert the calculated average back into an atmosphere label
const getAtmosphereLabel = (average) => {
  if (average < 1.5) {
    return "Quiet";
  }

  if (average < 2.5) {
    return "Moderate";
  }

  if (average < 3.5) {
    return "Busy";
  }

  return "Very Busy";
};

// Get the current Community Atmosphere Index for a pub
const getPubAtmosphere = (req, res) => {
  const pubId = req.params.pubId;

  // Check that the pub ID is valid
  if (!pubId || Number.isNaN(Number(pubId))) {
    return res.status(400).json({
      message: "A valid pub ID is required.",
    });
  }

  // Check that the pub exists
  const pubSql = `
    SELECT pub_id
    FROM pubs
    WHERE pub_id = ?
  `;

  db.query(pubSql, [pubId], (pubError, pubs) => {
    if (pubError) {
      console.error("Pub check error:", pubError);

      return res.status(500).json({
        message: "Unable to check the pub.",
      });
    }

    if (pubs.length === 0) {
      return res.status(404).json({
        message: "Pub not found.",
      });
    }

    // Only use reports submitted during the last 3 hours
    const atmosphereSql = `
      SELECT
        atmosphere_level,
        report_time
      FROM atmosphere_reports
      WHERE pub_id = ?
        AND report_time >= DATE_SUB(NOW(), INTERVAL 3 HOUR)
      ORDER BY report_time DESC
    `;

    db.query(atmosphereSql, [pubId], (error, reports) => {
      if (error) {
        console.error("Atmosphere retrieval error:", error);

        return res.status(500).json({
          message: "Unable to retrieve the current atmosphere.",
        });
      }

      // Start every atmosphere option at zero
      const breakdown = {
        Quiet: 0,
        Moderate: 0,
        Busy: 0,
        "Very Busy": 0,
      };

      // Return an empty result when there are no recent reports
      if (reports.length === 0) {
        return res.json({
          pub_id: Number(pubId),
          atmosphere: null,
          average_score: null,
          report_count: 0,
          last_updated: null,
          breakdown,
          message: "No recent atmosphere reports are available.",
        });
      }

      let totalScore = 0;
      let validReportCount = 0;

      reports.forEach((report) => {
        const atmosphereLevel = report.atmosphere_level;
        const score = atmosphereValues[atmosphereLevel];

        // Only include valid atmosphere values
        if (score) {
          totalScore += score;
          validReportCount += 1;
          breakdown[atmosphereLevel] += 1;
        }
      });

      // Protect against unexpected values in the database
      if (validReportCount === 0) {
        return res.json({
          pub_id: Number(pubId),
          atmosphere: null,
          average_score: null,
          report_count: 0,
          last_updated: null,
          breakdown,
          message: "No valid atmosphere reports are available.",
        });
      }

      const averageScore = totalScore / validReportCount;
      const atmosphereLabel = getAtmosphereLabel(averageScore);

      return res.json({
        pub_id: Number(pubId),
        atmosphere: atmosphereLabel,
        average_score: Number(averageScore.toFixed(2)),
        report_count: validReportCount,
        last_updated: reports[0].report_time,
        breakdown,
      });
    });
  });
};

// Submit or update an atmosphere report
const submitAtmosphereReport = (req, res) => {
  const userId = req.user.user_id;
  const { pub_id, atmosphere_level } = req.body;

  // Check that all required fields were sent
  if (!pub_id || !atmosphere_level) {
    return res.status(400).json({
      message: "Pub and atmosphere level are required.",
    });
  }

  const allowedLevels = ["Quiet", "Moderate", "Busy", "Very Busy"];

  // Only accept the atmosphere options used by PintPoint
  if (!allowedLevels.includes(atmosphere_level)) {
    return res.status(400).json({
      message: "Atmosphere must be Quiet, Moderate, Busy or Very Busy.",
    });
  }

  // Check that the pub exists
  const pubSql = `
    SELECT pub_id
    FROM pubs
    WHERE pub_id = ?
  `;

  db.query(pubSql, [pub_id], (pubError, pubs) => {
    if (pubError) {
      console.error("Pub check error:", pubError);

      return res.status(500).json({
        message: "Unable to check the pub.",
      });
    }

    if (pubs.length === 0) {
      return res.status(404).json({
        message: "Pub not found.",
      });
    }

    // Check whether this user already reported this pub
    const existingReportSql = `
      SELECT report_id
      FROM atmosphere_reports
      WHERE user_id = ? AND pub_id = ?
    `;

    db.query(
      existingReportSql,
      [userId, pub_id],
      (reportError, existingReports) => {
        if (reportError) {
          console.error("Atmosphere report check error:", reportError);

          return res.status(500).json({
            message: "Unable to check existing atmosphere reports.",
          });
        }

        // Update the user's previous report
        if (existingReports.length > 0) {
          const reportId = existingReports[0].report_id;

          const updateSql = `
            UPDATE atmosphere_reports
            SET atmosphere_level = ?, report_time = NOW()
            WHERE report_id = ? AND user_id = ?
          `;

          db.query(
            updateSql,
            [atmosphere_level, reportId, userId],
            (updateError) => {
              if (updateError) {
                console.error("Atmosphere update error:", updateError);

                return res.status(500).json({
                  message: "Unable to update the atmosphere report.",
                });
              }

              return res.json({
                message: "Atmosphere report updated successfully.",
                report: {
                  report_id: reportId,
                  user_id: userId,
                  pub_id: Number(pub_id),
                  atmosphere_level,
                  report_time: new Date(),
                },
              });
            }
          );

          return;
        }

        // Save a new atmosphere report
        const insertSql = `
          INSERT INTO atmosphere_reports
            (user_id, pub_id, atmosphere_level, report_time)
          VALUES (?, ?, ?, NOW())
        `;

        db.query(
          insertSql,
          [userId, pub_id, atmosphere_level],
          (insertError, result) => {
            if (insertError) {
              console.error("Atmosphere insert error:", insertError);

              return res.status(500).json({
                message: "Unable to submit the atmosphere report.",
              });
            }

            return res.status(201).json({
              message: "Atmosphere report submitted successfully.",
              report: {
                report_id: result.insertId,
                user_id: userId,
                pub_id: Number(pub_id),
                atmosphere_level,
                report_time: new Date(),
              },
            });
          }
        );
      }
    );
  });
};

module.exports = {
  getPubAtmosphere,
  submitAtmosphereReport,
};