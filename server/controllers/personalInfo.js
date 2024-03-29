import User from "../db/models/user.js";
import PersonalInfo from "../db/models/personalInfo.js";
import Contact from "../db/models/contact.js";
import Address from "../db/models/address.js";
import getUserById from "../services/getUserById.js";
import getPersonalInfoById from "../services/getPersonalInfoById.js";
import updateRefs from "../services/updateRefs.js";
import OPT from "../db/models/opt.js";
import removeEmptyFields from "../services/removeEmptyFields.js";

const createPersonalInfo = async (req, res) => {
    try {
        const user_id = req.params?.id;
        const personal_info = removeEmptyFields(req.body);
        console.log(personal_info);
        const update_fields = {
            address: Address,
            reference: Contact,
            emergency_contact: Contact,
            opt: OPT,
        };

        const user = await getUserById(user_id);
        if (!user.personal_info) {
            // Create and convert reference & emergency_contact to Object_id
            const bulkWriteOperations = [];
            bulkWriteOperations.push({
                insertOne: {
                    document: personal_info.reference,
                },
            });
            personal_info.emergency_contact.forEach((emergencyContact) => {
                bulkWriteOperations.push({
                    insertOne: {
                        document: emergencyContact,
                    },
                });
            });
            await Contact.bulkWrite(bulkWriteOperations).then((result) => {
                console.log(result.insertedIds);
                personal_info.reference = result.insertedIds["0"];
                personal_info.emergency_contact = Object.values(result.insertedIds).slice(1);
            });

            // Create and convert address to Object_id
            const new_address = new Address({ ...personal_info.address });
            await new_address.save().then((address) => {
                personal_info.address = address._id;
            });

            // Create and convert opt to Object_id
            const opt = new OPT({ ...personal_info.opt });
            await opt.save().then((opt) => {
                personal_info.opt = opt._id;
            });
            const pinfo = new PersonalInfo({ ...personal_info });
            await pinfo.save().then(async (info) => {
                const user = await getUserById(user_id);
                await User.findByIdAndUpdate(
                    user._id,
                    { ...user, personal_info: info._id },
                    { new: true }
                ).then((result) => {
                    res.status(200).json(result);
                });
            });
        } else {
            const prev_personal_info = await getPersonalInfoById(user.personal_info);

            if (Object.keys(update_fields).some((field) => personal_info[field])) {
                await updateRefs({ update_fields, personal_info, prev_personal_info });
            }

            await PersonalInfo.findOneAndUpdate(
                { _id: user.personal_info },
                { ...personal_info },
                { new: true }
            ).then((info) => {
                res.status(201).json({ info, message: "Successfully updated." });
            });
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({
            err,
            message: "Error on saving personal info.",
        });
    }
};

// const updatePersonalInfo = async (req, res) => {
//     try {
//         const user_id = req.params?.id;
//         const update_info = req.body;
//         const update_fields = {
//             address: Address,
//             reference: Contact,
//             emergency_contact: Contact,
//             opt: OPT,
//         };

//         const user = await getUserById(user_id);
//         const personal_info = await getPersonalInfoById(user.personal_info);

//         if (Object.keys(update_fields).some((field) => update_info[field])) {
//             await updateRefs({ update_fields, update_info, personal_info });
//         }

//         await PersonalInfo.findOneAndUpdate(
//             { _id: user.personal_info },
//             { ...personal_info, ...update_info }
//         ).then((info) => {
//             res.status(201).json({ message: "Successfully updated." });
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             err,
//             message: "Error on saving personal info.",
//         });
//     }
// };
const getPersonalInfo = async (req, res) => {
    const profile_id = req.params?.id;
    await PersonalInfo.findById(profile_id)
        .populate('reference emergency_contact address opt optDocs')
        .then(personal_info => {
            res.status(201).json(personal_info);
        }).catch(err => {
            res.status(500).json({ err, message: "GET personal info Error" })
        });
}

// const updatInfo = async (req, res) => {
//     try {
//         const profile_id = req.params.id;
//         const update_info = req.body;
//         if (!profile_id) {
//             return res.status(400).json({ message: "Profile ID is required." });
//         }
//         if (Object.keys(update_info).length === 0) {
//             return res.status(400).json({ message: "Update data is required." });
//         }
//         const personal_info = await PersonalInfo.findById(profile_id);
//         if (!personal_info) {
//             return res.status(404).json({ message: "Personal info not found." });
//         }
//         const update_fields = {
//             address: Address,
//             reference: Contact,
//             emergency_contact: Contact,
//             opt: OPT,
//         };

//         await updateRefs({ update_fields, update_info, personal_info });
//         await PersonalInfo.findByIdAndUpdate(profile_id, update_info, { new: true });
//         res.status(200).json({ message: "Personal info updated successfully." });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Error updating personal info.", error: err.message });
//     }
// };

const updatInfo = async (req, res) => {
    try {
        const profile_id = req.params.id;
        const { review_status, review_memo } = req.body;
        if (!profile_id) {
            return res.status(400).json({ message: "Profile ID is required." });
        } const update_info = {};
        if (review_status !== undefined) update_info.review_status = review_status;
        if (review_memo !== undefined) update_info.review_memo = review_memo;
        await PersonalInfo.findByIdAndUpdate(profile_id, update_info, { new: true });
        res.status(200).json({ message: "Personal info updated successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating personal info.", error: err.message });
    }
};

const uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: "No file uploaded." });
        }
        const file = req.file;
        const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
        res.status(200).send({ imageUrl: imageUrl });
    } catch (error) {
        res.status(500).send({ error, message: "Server Error" });
    }
};

const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: 'No file uploaded.' });
        };
        const file = req.file;
        console.log("file: ", file);
        const documentUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
        res.status(200).send({ documentUrl: documentUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server Error' });
    }
};

export { createPersonalInfo, getPersonalInfo, uploadPhoto, uploadDocument, updatInfo };
