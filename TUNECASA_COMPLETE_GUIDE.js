/**
 * ================================================================================
 *                    TUNECASA CODING PATTERNS & CODE ANALYSIS
 *                         Complete Reference Guide
 * ================================================================================
 * 
 * Project: TuneCasa - Music Streaming Platform / LearnHub Implementation
 * Architecture: MERN Stack (MongoDB/Oracle, Express.js, React, Node.js)
 * 
 * Source: C:\Users\black\.gemini\antigravity\brain\34da58b2-bbba-470a-8be1-1bf5a8b75565\
 */

// ================================================================================
// PART 1: FILE IMPORT PATTERN
// ================================================================================

/**
 * Backend Controller Imports
 * Source: albumController.js Lines 1-5
 * ORDER: External packages → Models → Other imports
 */
import { v2 as cloudinary } from "cloudinary";    // External service
import albumModel from "../models/albumModel.js"; // Main model
import Artist from "../models/artistModel.js";    // Related models
import notifiactionModel from "../models/notifiactionModel.js";
import User from "../models/userModel.js";

/**
 * Frontend Redux Slice Imports
 * Source: authSlice.js Lines 1-4
 * ORDER: Redux Toolkit → Constants → API config → External
 */
import { createSlice } from "@reduxjs/toolkit";
import { STATUS } from "../globals/components/enumStatus/Status";
import { API, APIAuthenticated } from "../http";
import axios from "axios";


// ================================================================================
// PART 2: CONTROLLER FUNCTION PATTERNS
// ================================================================================

/**
 * Pattern A: CREATE with File Upload
 * Source: albumController.js Lines 8-82
 */
export const addAlbum = async (req, res) => {
    try {
        // 1. Extract data from request
        const { name, desc, bgColour, genre } = req.body;
        const imageFile = req.file;
        const userId = req.user.id;

        // 2. Validate required fields
        if (!name || !desc || !bgColour) {
            return res.status(404).json({ message: "Please provide name, description, and background color." });
        }

        // 3. Validate file upload
        if (!imageFile) {
            return res.status(403).json({ message: "Please upload an image for the album." });
        }

        // 4. Check for duplicates
        const existingAlbum = await albumModel.findOne({ name });
        if (existingAlbum) {
            return res.status(400).json({ message: "Album name must be unique." });
        }

        // 5. Upload to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: "image",
        });

        // 6. Prepare data object
        const albumData = {
            userId,
            name,
            desc,
            bgColour,
            genre,
            image: imageUpload.secure_url,
        };

        // 7. Create in database
        const album = await albumModel.create(albumData);

        // 8. Send notifications to followers (nested try-catch)
        try {
            const artist = await User.findById(userId);
            const artistProfile = await Artist.findOne({ userId });

            if (artist && artistProfile && Array.isArray(artistProfile.followers) && artistProfile.followers.length > 0) {
                for (const followerId of artistProfile.followers) {
                    await notifiactionModel.create({
                        userId: followerId,
                        content: `🎵 ${artist.username} just dropped a new album: "${name}"!`,
                        type: "album",
                        isRead: false,
                        name: name,
                        image: imageUpload.secure_url,
                    });
                }
            }
        } catch (err) {
            console.error("Error sending album notifications:", err);
        }

        // 9. Success response
        res.status(200).json({ message: "Album is successfully added!", data: album });
    } catch (err) {
        console.error("Album creation error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


/**
 * Pattern B: GET ALL (Simple)
 * Source: albumController.js Lines 86-92
 */
export const getAllAlbum = async (req, res) => {
    const allAlbums = await albumModel.find();
    if (allAlbums.length < 1) {
        return res.status(404).json({ message: "Album not found" });
    }
    res.status(200).json({ message: "Successfully get all the album", data: allAlbums })
}


/**
 * Pattern C: GET SINGLE by ID
 * Source: albumController.js Lines 122-129
 */
export const fetchSingleAlbum = async (req, res) => {
    const id = req.params.id;
    const singleAlbum = await albumModel.findById(id);
    if (!singleAlbum) {
        return res.status(404).json({ message: "Album not found" });
    }
    res.status(200).json({ message: "Successfully fetch the single album", data: singleAlbum });
}


/**
 * Pattern D: DELETE
 * Source: albumController.js Lines 148-155
 */
export const deleteAlbum = async (req, res) => {
    const id = req.params.id;
    const deleteAlbum = await albumModel.findByIdAndDelete(id);
    if (!deleteAlbum) {
        return res.status(404).json({ message: "Album not found" });
    }
    res.status(200).json({ message: "Successfully delete the album" })
}


/**
 * Pattern E: UPDATE with Optional Fields
 * Source: albumController.js Lines 158-188
 */
export const updateAlbum = async (req, res) => {
    const id = req.params.id;
    const { name, desc, bgColour } = req.body;
    const imageFile = req.files?.image?.[0];

    // Build update object conditionally
    const updateData = {};
    if (name) updateData.name = name;
    if (desc) updateData.desc = desc;
    if (bgColour) updateData.bgColour = bgColour;

    // Handle optional file upload
    if (imageFile) {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: "image",
        });
        updateData.image = imageUpload.secure_url;
    }

    // Update with $set and return new document
    const updatedAlbum = await albumModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    );

    if (!updatedAlbum) {
        return res.status(404).json({ message: "Album not found" });
    }
    res.status(200).json({ message: "Album updated successfully", data: updatedAlbum });
};


/**
 * Pattern F: TOGGLE (Like/Unlike)
 * Source: likeController.js Lines 4-21
 */
export const addLike = async (req, res) => {
    const songId = req.params.songId;
    const userId = req.user.id;

    try {
        // Check if already exists
        const existingLike = await Like.findOne({ userId, songId });

        if (existingLike) {
            return res.status(400).json({ message: 'You have already liked this song.' });
        }

        const newLike = new Like({ userId, songId });
        await newLike.save();

        res.status(200).json({ message: 'Song liked successfully!', newLike });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


/**
 * Pattern G: AGGREGATION Query
 * Source: likeController.js Lines 60-95
 */
export const getTotalLikesPerSong = async (req, res) => {
    try {
        const totalLikes = await Like.aggregate([
            // Stage 1: Group by songId
            {
                $group: {
                    _id: "$songId",
                    totalLikes: { $sum: 1 },
                },
            },
            // Stage 2: Join with songs collection
            {
                $lookup: {
                    from: "songs",
                    localField: "_id",
                    foreignField: "_id",
                    as: "song",
                },
            },
            // Stage 3: Flatten joined array
            {
                $unwind: { path: "$song", preserveNullAndEmptyArrays: true },
            },
            // Stage 4: Shape output
            {
                $project: {
                    _id: 0,
                    songId: "$_id",
                    songName: { $ifNull: ["$song.name", "Unknown"] },
                    totalLikes: 1,
                },
            },
        ]);

        res.status(200).json({ message: "Total likes per song", data: totalLikes });
    } catch (error) {
        console.error("Error fetching total likes:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// ================================================================================
// PART 3: ROUTE FILE PATTERN
// ================================================================================

/**
 * Route File Structure
 * Source: userRoute.js
 */
import { Router } from "express";
import errorHandler from "../services/catchAsyncError.js";
import { isAuthenticated, restrictTo, Role } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js"

const router = Router();

// PUBLIC ROUTES (no auth)
router.route("/login").post(errorHandler(login))
router.route("/auth/google").get(googleLogin)

// AUTHENTICATED ROUTES
router.route("/user/profile").get(isAuthenticated, errorHandler(profile))

// AUTHENTICATED + FILE UPLOAD
router.route("/user/profile/:id").patch(
    upload.fields([{ name: 'image', maxCount: 1 }]),
    errorHandler(updateUser)
);

// ADMIN ONLY ROUTES
router.route("/user").get(
    isAuthenticated,
    restrictTo(Role.Admin),
    errorHandler(fetchAllUser)
)

// ROLE ASSIGNMENT MIDDLEWARE
router.route("/user/register").post((req, res, next) => {
    req.body.role = "user";
    next();
}, errorHandler(register));

export default router


// ================================================================================
// PART 4: REDUX SLICE PATTERN
// ================================================================================

/**
 * Slice Definition Structure
 * Source: authSlice.js
 */
const authSlice = createSlice({
    name: "auth",                    // Slice name
    initialState: {                  // All state properties
        data: [],
        status: STATUS.LOADING,
        token: "",
        profile: "",
        singleUser: null,
    },
    reducers: {                      // Synchronous actions
        setUserData(state, action) {
            state.data = action.payload
        },
        setStatus(state, action) {
            state.status = action.payload
        },
        resetStatus(state) {
            state.status = STATUS.LOADING
        },
        setToken(state, action) {
            state.token = action.payload;
            console.log(state.token);    // Debug logging in reducers
        },
        setProfile(state, action) {
            state.profile = action.payload
        },
        // Update nested item in array
        setUpdateUserProfile(state, action) {
            const index = state.data.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
                state.data[index] = {
                    ...state.data[index],
                    ...action.payload.data
                }
            }
        },
    }
})

// Export actions and reducer
export const { setUserData, setStatus, resetStatus, setToken, setProfile } = authSlice.actions
export default authSlice.reducer


/**
 * Thunk Function Pattern
 * Pattern: export function → return async function → dispatch
 */
export function login(data) {
    return async function loginThunk(dispatch) {
        dispatch(setStatus(STATUS.LOADING));
        try {
            const response = await API.post("/api/login", data);
            if (response.status === 200) {
                const { token, data } = response.data;      // Destructure response
                dispatch(setProfile(data));
                dispatch(setStatus(STATUS.SUCCESS));
                dispatch(setToken(token));
                localStorage.setItem('token', token);        // Persist token
            } else {
                dispatch(setStatus(STATUS.ERROR));
            }
        } catch (err) {
            dispatch(setStatus(STATUS.ERROR));
        }
    }
}

/**
 * Pattern for update with file
 */
export function updateUserProfile({ id, userData }) {
    return async function updateUserProfileThunk(dispatch) {
        dispatch(setStatus(STATUS.LOADING));
        try {
            const response = await APIAuthenticated.patch(`/api/user/profile/${id}`, userData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                const { data } = response.data;
                dispatch(setUpdateUserProfile({ id, data }));
                dispatch(setStatus(STATUS.SUCCESS));
            } else {
                dispatch(setStatus(STATUS.ERROR));
                throw new Error("Update failed");
            }
        } catch (err) {
            dispatch(setStatus(STATUS.ERROR));
            console.error("Error updating profile:", err);
            throw err;
        }
    };
}


// ================================================================================
// PART 5: API CONFIGURATION PATTERN
// ================================================================================

/**
 * API Configuration
 * Source: http/index.js
 */

// PUBLIC API (no auth required)
const API = axios.create({
    baseURL: 'http://localhost:3000/',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// AUTHENTICATED API (requires token)
const APIAuthenticated = axios.create({
    baseURL: 'http://localhost:3000/',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// INTERCEPTOR: Auto-attach token to every request
APIAuthenticated.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log("Token from the local storage", token)
        if (token) {
            config.headers['Authorization'] = `${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export { API, APIAuthenticated };


// ================================================================================
// PART 6: RESPONSE FORMAT STANDARD
// ================================================================================

/**
 * Success Response
 */
// res.status(200).json({
//     message: "Successfully [action]",
//     data: result
// });

/**
 * Error Responses
 */
// Not found
// res.status(404).json({ message: "Album not found" });

// Validation error
// res.status(400).json({ message: "Album name must be unique." });

// Unauthorized
// res.status(403).json({ message: "Please upload an image for the album." });

// Server error
// res.status(500).json({ message: "Server error", error: error.message });


// ================================================================================
// PART 7: NAMING CONVENTIONS
// ================================================================================

/**
 * NAMING CONVENTIONS TABLE:
 *
 * | Type              | Pattern              | Example                    |
 * |-------------------|----------------------|----------------------------|
 * | Controller file   | featureController.js | albumController.js         |
 * | Model file        | featureModel.js      | albumModel.js              |
 * | Route file        | featureRoute.js      | userRoute.js               |
 * | Slice file        | featureSlice.js      | authSlice.js               |
 * | Export function   | Verb + Noun          | getAllAlbum, fetchSingleUser |
 * | Reducer           | set + Property       | setUserData, setStatus     |
 * | Thunk suffix      | ...Thunk             | loginThunk, registerUserThunk |
 */


// ================================================================================
// PART 8: QUICK REFERENCE CHECKLIST
// ================================================================================

/**
 * Controller Function Checklist:
 * - [ ] export const functionName = async (req, res) => {
 * - [ ] Extract: const { field } = req.body;
 * - [ ] Extract ID: const { id } = req.params;
 * - [ ] Extract user: const userId = req.user.id;
 * - [ ] Wrap in try-catch
 * - [ ] Return early with status code on error
 * - [ ] Success: res.status(200).json({ message: "", data: })
 */

/**
 * Redux Thunk Checklist:
 * - [ ] export function name(params) {
 * - [ ] return async function nameThunk(dispatch) {
 * - [ ] dispatch(setStatus(STATUS.LOADING));
 * - [ ] try { } catch { dispatch(setStatus(STATUS.ERROR)); }
 * - [ ] Check response.status === 200
 * - [ ] dispatch(setData(response.data.data));
 * - [ ] dispatch(setStatus(STATUS.SUCCESS));
 */


// ================================================================================
// END OF DOCUMENT
// ================================================================================

/**
 * Generated from TuneCasa-FYP source code analysis
 * Original Location: C:\Users\black\.gemini\antigravity\brain\34da58b2-bbba-470a-8be1-1bf5a8b75565\
 */
